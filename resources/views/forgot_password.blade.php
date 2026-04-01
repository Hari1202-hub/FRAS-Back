<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Password Reset Token</title>
</head>
<body>
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password.</p>

    <p><strong>Your reset token:</strong></p>
    <h3>{{ $token }}</h3>

    <p>Please copy this token and use it in the password reset form.</p>

    <p>If you did not request a password reset, no further action is required.</p>

    <br>
    <p>Thanks,<br>Your App Team</p>
</body>
</html>
