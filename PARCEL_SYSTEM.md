# 📦 Parcel & Mailroom Management System

## Overview
The Parcel Management System is a digital logbook designed to streamline package deliveries in the hostel. It replaces the physical register at the security gate, ensuring that no package goes missing and every handover is authenticated with a secure PIN.

---

## 🔄 The Workflow

### 1. Reception (Guard's Role)
*   **Action**: A delivery agent arrives with a package for "Rahul" (Room 101).
*   **Process**: The Guard selects the student in the app and logs the courier type (e.g., Amazon).
*   **System Event**: The backend generates a random **4-Digit PIN** (e.g., `8821`) and logs the timestamp.

### 2. Notification (Student's Role)
*   **Action**: The student opens the HostelOS app.
*   **Visual**: They see a **Yellow Alert**: *"📦 You have 1 Package waiting!"*.
*   **Information**: They can view the Courier Name and the unique **Pickup Code**.

### 3. Collection (Handover)
*   **Action**: The student goes to the gate and shows the code `8821`.
*   **Process**: The Guard enters/verifies the code and clicks **"Mark Collected"**.
*   **System Event**: The status updates to `Collected`, and the transaction is closed.

---

## 🛠️ Technical Implementation

### Database Schema (`parcels` table)
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | Integer | Unique Parcel ID |
| `student_id` | Integer | Link to `students` table |
| `courier` | String | e.g. "Amazon", "BlueDart" |
| `pickup_code` | String | Random 4-digit PIN |
| `status` | String | "Waiting" or "Collected" |
| `arrival_time` | DateTime | Timestamp of entry |
| `collected_at` | DateTime | Timestamp of handover |

### API Endpoints
1.  `POST /parcels/receive`: Log a new package (Generates PIN).
2.  `GET /parcels/pending`: View all uncollected packages (Guard View).
3.  `GET /parcels/my-parcels`: View my specific packages (Student View).
4.  `POST /parcels/collect/{id}`: Verify PIN and mark as collected.

---

## 📱 User Interface Plans
*   **Mailroom Page**: A dual-view page.
    *   **Admin Tab**: Form to add package + Table of inventory.
    *   **Student Tab**: Grid of package cards with large PIN numbers.
*   **Dashboard Widget**: A summary card showing the count of waiting packages.
