from flask import Flask, request, jsonify
from deepface import DeepFace
import os
import numpy as np
import psycopg2
from datetime import datetime
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

# Database connection function
def get_db_connection():
    return psycopg2.connect(
        host="192.168.1.179",
        database="postgres",
        user="postgres",
        password="root"
    )

# Database initialization
def init_db():
    conn = get_db_connection()
    c = conn.cursor()

    # Create users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            roll_number TEXT UNIQUE NOT NULL,
            face_embedding BYTEA NOT NULL,
            image_path TEXT NOT NULL
        )
    ''')

    # Create attendance table with fixed default status value
    c.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            status BOOLEAN DEFAULT FALSE,  -- False for absent, True for present
            time TIME NULL
        )
    ''')
    conn.commit()
    conn.close()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/register', methods=['POST'])
def register():
    try:
        if 'face_image' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['face_image']
        name = request.form.get('name')
        roll_number = request.form.get('roll_number')

        if not all([file, name, roll_number]):
            return jsonify({'error': 'Missing required fields'}), 400

        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        conn = get_db_connection()
        c = conn.cursor()

        # Check if roll number already exists
        c.execute("SELECT 1 FROM users WHERE roll_number = %s", (roll_number,))
        if c.fetchone():
            conn.close()
            return jsonify({'error': 'Roll number already exists'}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(f"{roll_number}_{file.filename}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            # Get face embedding using DeepFace
            try:
                embedding = DeepFace.represent(filepath, model_name="VGG-Face", enforce_detection=True)
                embedding_bytes = np.array(embedding).tobytes()  # Store as BYTEA in PostgreSQL
            except Exception as e:
                os.remove(filepath)
                conn.close()
                return jsonify({'error': 'Face detection failed. Use a clear image.'}), 400

            # Check if same face already exists
            c.execute("SELECT id, image_path FROM users")
            users = c.fetchall()
            for user_id, stored_image_path in users:
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
                except Exception:
                    continue

            # Insert into PostgreSQL database
            c.execute(
                "INSERT INTO users (name, roll_number, face_embedding, image_path) VALUES (%s, %s, %s, %s) RETURNING id",
                (name, roll_number, embedding_bytes, filepath)
            )
            user_id = c.fetchone()[0]  # Get the generated user ID

            # Insert attendance record with "absent" status and NULL for time
            c.execute(
                "INSERT INTO attendance (user_id, status, time) VALUES (%s, %s, NULL)",
                (user_id, False)  # Mark as absent and time as NULL
            )

            conn.commit()
            conn.close()

            return jsonify({
                'message': 'Registration successful',
                'user': {'name': name, 'roll_number': roll_number}
            }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    try:
        if 'face_image' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['face_image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        if file and allowed_file(file.filename):
            temp_filename = secure_filename(f"temp_{file.filename}")
            temp_filepath = os.path.join(app.config['UPLOAD_FOLDER'], temp_filename)
            file.save(temp_filepath)

            # Get face embedding for the uploaded image
            try:
                new_embedding = DeepFace.represent(temp_filepath, model_name="VGG-Face", enforce_detection=True)
                new_embedding = np.array(new_embedding)
            except Exception:
                os.remove(temp_filepath)
                return jsonify({'error': 'Failed to detect face in uploaded image'}), 400

            conn = get_db_connection()
            c = conn.cursor()
            c.execute("SELECT id, name, roll_number, face_embedding, image_path FROM users")
            users = c.fetchall()

            for user_id, name, roll_number, stored_embedding_bytes, stored_image_path in users:
                try:
                    # Verify using stored image path
                    similarity = DeepFace.verify(
                        img1_path=temp_filepath,
                        img2_path=stored_image_path,
                        model_name="VGG-Face",
                        enforce_detection=True,
                        distance_metric="cosine"
                    )

                    if similarity['verified']:
                        now = datetime.now()
                        
                        # Check if attendance is already marked as present
                        c.execute("""
                            SELECT 1 FROM attendance 
                            WHERE user_id = %s 
                            AND status = TRUE
                        """, (user_id,))
                        
                        if c.fetchone():
                            os.remove(temp_filepath)
                            conn.close()
                            return jsonify({
                                'error': 'Attendance already marked present'
                            }), 400

                        # Update attendance status from absent to present
                        c.execute("""
                            UPDATE attendance 
                            SET status = TRUE, time = %s
                            WHERE user_id = %s AND status = FALSE
                        """, (now.strftime('%H:%M:%S'), user_id))

                        conn.commit()
                        os.remove(temp_filepath)
                        conn.close()

                        return jsonify({
                            'message': 'Attendance marked successfully',
                            'user': {
                                'name': name,
                                'roll_number': roll_number,
                                'time': now.strftime('%H:%M:%S') 
                            }
                        }), 200
                        
                except Exception:
                    continue

            os.remove(temp_filepath)
            conn.close()
            return jsonify({'error': 'No matching face found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/get_all_attendance', methods=['GET'])
def get_all_attendance():
    try:
        conn = get_db_connection()
        query = '''
        SELECT u.roll_number, u.name, a.time, 
                CASE 
                    WHEN a.status = FALSE THEN 'Absent' 
                    ELSE 'Present' 
                END AS attendance_status
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        ORDER BY a.id ASC;
        '''
        c = conn.cursor()
        c.execute(query)
        attendance_data = c.fetchall()

        attendance_list = []
        for row in attendance_data:
            attendance_list.append({
                'roll_number':row[0],
                'name': row[1],
                'time': row[2].strftime('%H:%M:%S') if row[2] else None,
                'attendance_status': row[3]
            })

        # Close the connection
        conn.close()
        return jsonify({'attendance': attendance_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    init_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
