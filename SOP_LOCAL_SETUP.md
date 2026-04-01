# SOP: Setting Up FRASS Backend API (Laravel Project)

This Standard Operating Procedure (SOP) provides step-by-step instructions to set up the FRASS Backend API (Laravel project) located in the `htdocs` directory.

---

## Prerequisites
- PHP >= 8.0
- Composer
- MySQL or MariaDB
- Git (optional, for version control)
- Node.js & npm (for asset compilation, optional)

---

## 1. Clone or Copy the Project
- Place the project folder (`htdocs`) in your web server directory (e.g., `c:/wamp64/www/`).

---

## 2. Install PHP Dependencies
Open a terminal in the `htdocs` directory and run:

```
composer install
```

---

## 3. Copy Environment File
Copy the example environment file:

```
cp Copy.env .env
```

Or manually copy `Copy.env` to `.env` in the `htdocs` directory.

---

## 4. Configure Environment Variables
- Open `.env` in a text editor.
- Update the following database settings using the reference database provided to you:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

Replace `your_database_name`, `your_db_user`, and `your_db_password` with the credentials from the reference DB.

---

## 5. Generate Application Key
Run:

```
php artisan key:generate
```

---

## 6. Set Up Database
- Import the reference database SQL file into your MySQL/MariaDB server using a tool like phpMyAdmin or the MySQL command line:

```
mysql -u your_db_user -p your_database_name < reference_db.sql
```

---

## 7. (Optional) Run Migrations & Seeders
If you want to apply migrations or seeders:

```
php artisan migrate
php artisan db:seed
```

---

## 8. Install Node.js Dependencies (Optional, for Frontend Assets)
If you need to compile frontend assets:

```
npm install
npm run dev
```

---

## 9. Serve the Application
You can serve the Laravel application in two ways:

### a) Using Artisan

```
php artisan serve
```

The app will be available at `http://localhost:8000` by default.

### b) Using Local Virtual Host
- Configure your web server (Apache/Nginx) to point the document root to `htdocs/public`.
- Update your hosts file to map a local domain (e.g., `frass.local`).

---

## 10. Test the API
- Open your browser or API tool (e.g., Postman) and access your API endpoints.

---

## Troubleshooting
- Ensure all required PHP extensions are installed.
- Check `.env` for correct database credentials.
- Review logs in `storage/logs/` for errors.

---

## Notes
- Always keep your `.env` file secure and never commit it to version control.
- For production, set up proper permissions for `storage` and `bootstrap/cache` directories.

---

**End of SOP**
