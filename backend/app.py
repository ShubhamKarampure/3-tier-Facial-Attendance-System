from flask import Flask, request, jsonify
from deepface import DeepFace
import sqlite3
import os
from datetime import datetime
import numpy as np
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins="*", methods=["OPTIONS", "POST"])

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database initialization
def init_db():
    conn = sqlite3.connect('attendance.db')
    c = conn.cursor()
    # Create users table
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL,
                  roll_number TEXT UNIQUE NOT NULL,
                  face_embedding TEXT NOT NULL,
                  image_path TEXT NOT NULL)''')
    # Create attendance table
    c.execute('''CREATE TABLE IF NOT EXISTS attendance
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  user_id INTEGER,
                  date DATE NOT NULL,
                  time TIME NOT NULL,
                  FOREIGN KEY (user_id) REFERENCES users (id))''')
    conn.commit()
    conn.close()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
@app.route('/register', methods=['POST'])
def register():
    try:
        print("Received POST request to /register")
        
        if 'face_image' not in request.files:
            print("Error: No file uploaded")
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['face_image']
        name = request.form.get('name')
        roll_number = request.form.get('roll_number')

        print(f"Received file: {file.filename}")
        print(f"Name: {name}, Roll Number: {roll_number}")

        if not all([file, name, roll_number]):
            print("Error: Missing required fields")
            return jsonify({'error': 'Missing required fields'}), 400

        if file.filename == '':
            print("Error: No selected file")
            return jsonify({'error': 'No selected file'}), 400

        # Check if roll number exists BEFORE processing the image
        conn = sqlite3.connect('attendance.db')
        c = conn.cursor()
        
        print("Checking if roll number already exists...")
        c.execute("SELECT * FROM users WHERE roll_number = ?", (roll_number,))
        existing_user = c.fetchone()
        if existing_user:
            conn.close()
            print("Error: Roll number already exists")
            return jsonify({'error': 'Roll number already exists'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{roll_number}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            print(f"Saving file to: {filepath}")
            file.save(filepath)

            # Get face embedding using DeepFace
            try:
                print("Processing image with DeepFace...")
                embedding = DeepFace.represent(filepath, model_name="VGG-Face", enforce_detection=True)
                embedding_str = np.array(embedding).tobytes().hex()
            except Exception as e:
                print("DeepFace Error:", str(e))
                os.remove(filepath)  # Clean up the file if face detection fails
                conn.close()
                return jsonify({'error': 'Face detection failed. Use a clear image.'}), 400

            # Check if same face already exists
            print("Checking for duplicate faces...")
            c.execute("SELECT id, name, roll_number, face_embedding, image_path FROM users")
            users = c.fetchall()
            
            for user_id, user_name, user_roll, stored_embedding_hex, stored_image_path in users:
                try:
                    similarity = DeepFace.verify(
                        img1_path=filepath,
                        img2_path=stored_image_path,
                        model_name="VGG-Face",
                        enforce_detection=True,
                        distance_metric="cosine"
                    )
                    if similarity['verified']:
                        os.remove(filepath)
                        conn.close()
                        return jsonify({'error': 'User face already registered'}), 400
                except Exception as e:
                    continue

            print("Inserting into database...")
            c.execute("INSERT INTO users (name, roll_number, face_embedding, image_path) VALUES (?, ?, ?, ?)",
                     (name, roll_number, embedding_str, filepath))
            
            conn.commit()
            conn.close()

            print("Registration successful!")
            return jsonify({
                'message': 'Registration successful',
                'user': {
                    'name': name,
                    'roll_number': roll_number
                }
            }), 201

    except Exception as e:
        print("Unhandled Error:", str(e))
        if 'conn' in locals():
            conn.close()
        return jsonify({'error': str(e)}), 500

    return jsonify({'error': 'Unexpected error occurred'}), 500
            
@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    try:
        if 'face_image' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['face_image']
        
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        if file and allowed_file(file.filename):
            # Save temporary file
            temp_filename = secure_filename(f"temp_{file.filename}")
            temp_filepath = os.path.join(app.config['UPLOAD_FOLDER'], temp_filename)
            file.save(temp_filepath)
            
            # Get face embedding for the uploaded image
            try:
                new_embedding = DeepFace.represent(temp_filepath, model_name="VGG-Face", enforce_detection=True)
                new_embedding = np.array(new_embedding)
            except Exception as e:
                os.remove(temp_filepath)
                return jsonify({'error': 'Failed to detect face in uploaded image'}), 400
            
            # Compare with stored embeddings
            conn = sqlite3.connect('attendance.db')
            c = conn.cursor()
            c.execute("SELECT id, name, roll_number, face_embedding, image_path FROM users")
            users = c.fetchall()
            
            for user_id, name, roll_number, stored_embedding_hex, stored_image_path in users:
                try:
                    # Convert stored embedding back to numpy array
                    stored_embedding = np.frombuffer(bytes.fromhex(stored_embedding_hex))
                    
                    # Verify using the actual stored image path
                    similarity = DeepFace.verify(
                        img1_path=temp_filepath,
                        img2_path=stored_image_path,
                        model_name="VGG-Face",
                        enforce_detection=True,
                        distance_metric="cosine"
                    )
                    
                    if similarity['verified']:
                        # Mark attendance
                        now = datetime.now()
                        
                        # Check if attendance already marked for today
                        c.execute("""
                            SELECT id FROM attendance 
                            WHERE user_id = ? AND date = ? 
                            AND time >= datetime('now', '-30 minutes')
                        """, (user_id, now.date()))
                        
                        if c.fetchone() is None:  # Only mark if no recent attendance
                            c.execute("INSERT INTO attendance (user_id, date, time) VALUES (?, ?, ?)",
                                    (user_id, now.date(), now.strftime('%H:%M:%S')))
                            conn.commit()
                            
                            os.remove(temp_filepath)  # Clean up temporary file
                            conn.close()
                            
                            return jsonify({
                                'message': 'Attendance marked successfully',
                                'user': {
                                    'name': name,
                                    'roll_number': roll_number,
                                    'date': now.date().isoformat(),
                                    'time': now.strftime('%H:%M:%S')
                                }
                            }), 200
                        else:
                            os.remove(temp_filepath)
                            conn.close()
                            return jsonify({'error': 'Attendance already marked in the last 30 minutes'}), 400
                            
                except Exception as e:
                    continue
            
            os.remove(temp_filepath)  # Clean up temporary file
            conn.close()
            return jsonify({'error': 'No matching face found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    init_db()
    app.run(debug=True)