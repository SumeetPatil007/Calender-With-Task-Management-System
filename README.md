# Calendar & Task Management — Junior Dev Task

## Requirements implemented
- Calendar month view with navigation.
- Click a date to view/add/edit tasks in the sidebar.
- Add / edit / delete / mark complete (AJAX).
- Tasks stored in relational DB (MySQL) with prepared statements.
- Responsive (Bootstrap).

## Setup
1. Ensure PHP (>=7.4), Composer optional, and MySQL are installed.
2. Create database:
   - Create DB `calendar_app`, or edit `src/db.php` to point to your DB.
   - Run `sql/init.sql` to create `tasks` table and sample data:
     ```
     mysql -u root -p calendar_app < sql/init.sql
     ```
3. Place project in your server web root (e.g., `public/` is web root).
   - If using PHP built-in server:
     ```
     php -S 0.0.0.0:8000 -t public
     ```
     Then open `http://localhost:8000`.
4. Edit `src/db.php` to set DB credentials.

## Notes & Improvements
- Uses prepared statements to prevent SQL injection.
- For larger projects, split API endpoints into smaller controllers and add routing.
- Add user authentication for multi-user support.
- Add server-side validation, pagination, and search endpoints.

## Files of interest
- `public/index.php` — UI
- `public/api.php` — AJAX endpoints
- `src/db.php` — DB connection
- `sql/init.sql` — schema + sample data
