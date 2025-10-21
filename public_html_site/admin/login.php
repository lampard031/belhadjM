<?php
require __DIR__ . '/config.php';

/* Logout optionnel */
if (isset($_GET['logout'])) {
  session_destroy();
  header('Location: /admin/login.php');
  exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $u = trim($_POST['user'] ?? '');
  $p = $_POST['pass'] ?? '';

  $ok = false;
  // 1) fallback mot de passe en clair si défini
  if (defined('ADMIN_PASS_PLAIN') && ADMIN_PASS_PLAIN !== '') {
    $ok = ($u === ADMIN_USER && hash_equals($p, ADMIN_PASS_PLAIN));
  }
  // 2) sinon, ou en plus, essaie le hash
  if (!$ok && $u === ADMIN_USER && password_verify($p, ADMIN_PASS_HASH)) {
    $ok = true;
  }

  if ($ok) {
    $_SESSION['admin_logged'] = true;
    header('Location: /admin/index.php'); exit;
  } else {
    $error = 'Identifiants invalides';
  }
}

?><!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin – Connexion</title>
<style>
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;background:#0b0f14;color:#fff;display:grid;place-items:center;height:100dvh;margin:0}
.card{width:min(420px,92vw);background:#131924;border-radius:16px;padding:24px;box-shadow:0 15px 40px rgba(0,0,0,.4)}
h1{margin:0 0 18px;font-size:22px}
input{width:100%;padding:10px;border-radius:10px;border:1px solid #2a3342;background:#0f141b;color:#fff}
label{display:block;margin-top:10px;margin-bottom:6px;color:#cbd5e1}
button{margin-top:16px;width:100%;padding:10px;border:0;border-radius:10px;background:#8a1212;color:#fff;font-weight:600;cursor:pointer}
.error{background:#5a0e0e;padding:10px;border-radius:10px;margin-bottom:10px}
</style>
</head>
<body>
  <div class="card">
    <h1>Admin – Connexion</h1>
    <?php if ($error): ?>
      <div class="error"><?= htmlspecialchars($error) ?></div>
    <?php endif; ?>
    <form method="post" autocomplete="off" novalidate>
      <label>Utilisateur</label>
      <input name="user" required value="<?= isset($_POST['user']) ? htmlspecialchars($_POST['user']) : '' ?>">
      <label>Mot de passe</label>
      <input type="password" name="pass" required>
      <button type="submit">Se connecter</button>
    </form>
  </div>
</body>
</html>
