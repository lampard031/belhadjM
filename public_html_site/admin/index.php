<?php
require __DIR__.'/config.php';
require_login();
ensure_tables();

$db = db();
$msg = ''; $err = '';

if ($_SERVER['REQUEST_METHOD']==='POST' && csrf_check($_POST['csrf'] ?? '')) {

  /* Winners add */
  if (($_POST['action'] ?? '') === 'add_winner') {
    $game = trim($_POST['game'] ?? '');
    $amount = (float)($_POST['amount'] ?? 0);
    $date = $_POST['date'] ?? '';
    $photo = upload_image('photo');
    if ($game && $amount>0 && $date && $photo) {
      $id = 'winner_'.bin2hex(random_bytes(8));
      $stmt = $db->prepare("INSERT INTO winners (id, amount, game, date, photo, isActive) VALUES (?,?,?,?,?,1)");
      $stmt->bind_param("sdsss", $id, $amount, $game, $date, $photo);
      $stmt->execute();
      $msg = "Gagnant ajouté ✅";
    } else {
      $err = "Champs manquants (photo obligatoire)";
    }
  }

  if (($_POST['action'] ?? '') === 'del_winner') {
    $id = $_POST['id'] ?? '';
    if ($id) {
      $stmt = $db->prepare("DELETE FROM winners WHERE id=?");
      $stmt->bind_param("s", $id);
      $stmt->execute();
      $msg = "Gagnant supprimé ✅";
    }
  }

  /* Events add */
  if (($_POST['action'] ?? '') === 'add_event') {
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $category = trim($_POST['category'] ?? '');
    $event_date = $_POST['event_date'] ?? null;
    $start_time = $_POST['start_time'] ?? null;
    $price = ($_POST['price'] !== '') ? (float)$_POST['price'] : null;
    $image_url = upload_image('image');
    if ($title) {
      $stmt = $db->prepare("INSERT INTO events (title,description,category,event_date,start_time,price,image_url,isActive) VALUES (?,?,?,?,?,?,?,1)");
      $stmt->bind_param("sssssdss",$title,$description,$category,$event_date,$start_time,$price,$image_url);
      $stmt->execute();
      $msg = "Événement ajouté ✅";
    } else $err = "Titre requis pour l'événement";
  }

  if (($_POST['action'] ?? '') === 'del_event') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id) {
      $stmt = $db->prepare("DELETE FROM events WHERE id=?");
      $stmt->bind_param("i", $id);
      $stmt->execute();
      $msg = "Événement supprimé ✅";
    }
  }

  /* Promotions add */
  if (($_POST['action'] ?? '') === 'add_promo') {
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $start_date = $_POST['start_date'] ?? null;
    $end_date = $_POST['end_date'] ?? null;
    $percent_off = ($_POST['percent_off'] !== '') ? (float)$_POST['percent_off'] : null;
    $fixed_amount = ($_POST['fixed_amount'] !== '') ? (float)$_POST['fixed_amount'] : null;
    $promo_code = trim($_POST['promo_code'] ?? '');
    $image_url = upload_image('image');
    if ($title) {
      $stmt = $db->prepare("INSERT INTO promotions (title,description,start_date,end_date,percent_off,fixed_amount,promo_code,image_url,isActive) VALUES (?,?,?,?,?,?,?, ?,1)");
      $stmt->bind_param("ssssddss",$title,$description,$start_date,$end_date,$percent_off,$fixed_amount,$promo_code,$image_url);
      $stmt->execute();
      $msg = "Promotion ajoutée ✅";
    } else $err = "Titre requis pour la promotion";
  }

  if (($_POST['action'] ?? '') === 'del_promo') {
    $id = (int)($_POST['id'] ?? 0);
    if ($id) {
      $stmt = $db->prepare("DELETE FROM promotions WHERE id=?");
      $stmt->bind_param("i", $id);
      $stmt->execute();
      $msg = "Promotion supprimée ✅";
    }
  }
}

/* data */
$winners = $db->query("SELECT * FROM winners ORDER BY createdAt DESC")->fetch_all(MYSQLI_ASSOC);
$events  = $db->query("SELECT * FROM events ORDER BY event_date DESC, start_time DESC")->fetch_all(MYSQLI_ASSOC);
$promos  = $db->query("SELECT * FROM promotions ORDER BY start_date DESC")->fetch_all(MYSQLI_ASSOC);
$csrf = csrf_token();



/* KPIs */
$kpiW = count($winners);
$kpiE = count($events);
$kpiP = count($promos);
?><!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Administration – Casino TRIPLE 7</title>
<link rel="stylesheet" href="/admin/assets/admin.css">
</head>
<body>
  <div class="top">
    <div class="brand"><span class="dot"></span> Casino TRIPLE 7 – Administration</div>
    <div><a class="btn secondary" href="/admin/login.php?logout=1">Déconnexion</a></div>
  </div>

  <div class="container">
    <?php if ($msg): ?><div class="note"><?=htmlspecialchars($msg)?></div><?php endif; ?>
    <?php if ($err): ?><div class="err"><?=htmlspecialchars($err)?></div><?php endif; ?>

    <div class="kpis">
      <div class="kpi"><small>Gagnants</small><div class="val"><?=$kpiW?></div></div>
      <div class="kpi"><small>Événements</small><div class="val"><?=$kpiE?></div></div>
      <div class="kpi"><small>Promotions</small><div class="val"><?=$kpiP?></div></div>
      <div class="kpi"><small>Base</small><div class="val"><?=htmlspecialchars(DB_NAME)?></div></div>
    </div>

    <div class="tabs">
      <button class="tab active" data-tab="winners">Gagnants</button>
      <button class="tab" data-tab="events">Événements</button>
      <button class="tab" data-tab="promos">Promotions</button>
    </div>

    <!-- TAB: WINNERS -->
    <section class="tabcontent active" id="winners">
      <div class="card">
        <h2>Ajouter un gagnant</h2>
        <div class="cnt">
          <form method="post" enctype="multipart/form-data" class="grid">
            <input type="hidden" name="csrf" value="<?=$csrf?>">
            <input type="hidden" name="action" value="add_winner">
            <div class="input-row">
              <div>
                <label>Jeu</label>
                <input name="game" placeholder="Lightning Link" required>
              </div>
              <div>
                <label>Montant ($)</label>
                <input name="amount" type="number" step="0.01" required>
              </div>
              <div>
                <label>Date</label>
                <input name="date" type="date" required>
              </div>
            </div>

            <div class="upload">
              <label>Photo du gagnant (obligatoire)</label>
              <input type="file" name="photo" accept="image/*" required data-preview="#preview-winner">
              <div class="preview" id="preview-winner"></div>
            </div>

            <div><button class="btn">Ajouter le gagnant</button></div>
          </form>
        </div>
      </div>

      <div class="card">
        <h2>Liste des gagnants</h2>
        <div class="cnt">
          <?php if (!$winners): ?>
            <div class="note">Aucun gagnant pour le moment</div>
          <?php else: ?>
          <table class="table">
            <thead><tr><th>Photo</th><th>Jeu</th><th>Montant</th><th>Date</th><th></th></tr></thead>
            <tbody>
            <?php foreach ($winners as $w): ?>
              <tr>
                <td data-label="Photo">
                  <?php if ($w['photo']): ?><img src="<?=htmlspecialchars($w['photo'])?>" style="width:60px;height:60px;object-fit:cover;border-radius:10px;border:1px solid #1f2937"><?php endif; ?>
                </td>
                <td data-label="Jeu"><?=htmlspecialchars($w['game'])?></td>
                <td data-label="Montant"><?=number_format((float)$w['amount'],2)?> $</td>
                <td data-label="Date"><?=htmlspecialchars($w['date'])?></td>
                <td data-label="">
                  <form method="post" onsubmit="return confirm('Supprimer ce gagnant ?')" class="row-actions">
                    <input type="hidden" name="csrf" value="<?=$csrf?>">
                    <input type="hidden" name="action" value="del_winner">
                    <input type="hidden" name="id" value="<?=htmlspecialchars($w['id'])?>">
                    <button class="btn danger" type="submit">Supprimer</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
            </tbody>
          </table>
          <?php endif; ?>
        </div>
      </div>
    </section>

    <!-- TAB: EVENTS -->
    <section class="tabcontent" id="events">
      <div class="card">
        <h2>Ajouter un événement</h2>
        <div class="cnt">
          <form method="post" enctype="multipart/form-data" class="grid">
            <input type="hidden" name="csrf" value="<?=$csrf?>">
            <input type="hidden" name="action" value="add_event">
            <div class="grid grid-3">
              <div>
                <label>Titre</label>
                <input name="title" required>
              </div>
              <div>
                <label>Catégorie</label>
                <input name="category" placeholder="Général">
              </div>
              <div>
                <label>Prix (optionnel)</label>
                <input name="price" type="number" step="0.01">
              </div>
            </div>

            <div class="grid grid-3">
              <div>
                <label>Date</label>
                <input type="date" name="event_date">
              </div>
              <div>
                <label>Heure</label>
                <input type="time" name="start_time">
              </div>
              <div>
                <label>Image (optionnel)</label>
                <input type="file" name="image" accept="image/*" data-preview="#preview-event">
                <div class="preview" id="preview-event"></div>
              </div>
            </div>

            <div>
              <label>Description</label>
              <textarea name="description" rows="3"></textarea>
            </div>
            <div><button class="btn">Ajouter l’événement</button></div>
          </form>
        </div>
      </div>

      <div class="card">
        <h2>Liste des événements</h2>
        <div class="cnt">
          <?php if (!$events): ?>
            <div class="note">Aucun événement</div>
          <?php else: ?>
          <table class="table">
            <thead><tr><th>Image</th><th>Titre</th><th>Catégorie</th><th>Date/Heure</th><th>Prix</th><th></th></tr></thead>
            <tbody>
            <?php foreach ($events as $e): ?>
              <tr>
                <td data-label="Image"><?php if ($e['image_url']): ?><img src="<?=htmlspecialchars($e['image_url'])?>" style="width:60px;height:60px;object-fit:cover;border-radius:10px;border:1px solid #1f2937"><?php endif; ?></td>
                <td data-label="Titre"><?=htmlspecialchars($e['title'])?></td>
                <td data-label="Catégorie"><?=htmlspecialchars($e['category'])?></td>
                <td data-label="Date/Heure"><?=htmlspecialchars(($e['event_date'] ?? '').' '.($e['start_time'] ?? ''))?></td>
                <td data-label="Prix"><?=($e['price']!==null)? number_format((float)$e['price'],2).' $' : '-'?></td>
                <td data-label="">
                  <form method="post" onsubmit="return confirm('Supprimer cet événement ?')" class="row-actions">
                    <input type="hidden" name="csrf" value="<?=$csrf?>">
                    <input type="hidden" name="action" value="del_event">
                    <input type="hidden" name="id" value="<?=htmlspecialchars($e['id'])?>">
                    <button class="btn danger" type="submit">Supprimer</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
            </tbody>
          </table>
          <?php endif; ?>
        </div>
      </div>
    </section>

    <!-- TAB: PROMOS -->
    <section class="tabcontent" id="promos">
      <div class="card">
        <h2>Ajouter une promotion</h2>
        <div class="cnt">
          <form method="post" enctype="multipart/form-data" class="grid">
            <input type="hidden" name="csrf" value="<?=$csrf?>">
            <input type="hidden" name="action" value="add_promo">

            <div class="grid grid-2">
              <div>
                <label>Titre</label>
                <input name="title" required>
              </div>
              <div>
                <label>Code promo (optionnel)</label>
                <input name="promo_code" placeholder="HAPPY10">
              </div>
            </div>

            <div class="grid grid-2">
              <div>
                <label>Début</label>
                <input type="date" name="start_date">
              </div>
              <div>
                <label>Fin</label>
                <input type="date" name="end_date">
              </div>
            </div>

            <div class="grid grid-2">
              <div>
                <label>% Réduction (optionnel)</label>
                <input type="number" step="0.01" name="percent_off">
              </div>
              <div>
                <label>Montant fixe (optionnel)</label>
                <input type="number" step="0.01" name="fixed_amount">
              </div>
            </div>

            <div class="grid grid-2">
              <div>
                <label>Image (optionnel)</label>
                <input type="file" name="image" accept="image/*" data-preview="#preview-promo">
                <div class="preview" id="preview-promo"></div>
              </div>
              <div>
                <label>Description</label>
                <textarea name="description" rows="3"></textarea>
              </div>
            </div>

            <div><button class="btn">Ajouter la promotion</button></div>
          </form>
        </div>
      </div>

      <div class="card">
        <h2>Liste des promotions</h2>
        <div class="cnt">
          <?php if (!$promos): ?>
            <div class="note">Aucune promotion</div>
          <?php else: ?>
          <table class="table">
            <thead><tr><th>Image</th><th>Titre</th><th>Dates</th><th>Réduc</th><th>Code</th><th></th></tr></thead>
            <tbody>
            <?php foreach ($promos as $p): ?>
              <tr>
                <td data-label="Image"><?php if ($p['image_url']): ?><img src="<?=htmlspecialchars($p['image_url'])?>" style="width:60px;height:60px;object-fit:cover;border-radius:10px;border:1px solid #1f2937"><?php endif; ?></td>
                <td data-label="Titre"><?=htmlspecialchars($p['title'])?></td>
                <td data-label="Dates"><?=htmlspecialchars(($p['start_date']??'').' → '.($p['end_date']??''))?></td>
                <td data-label="Réduc">
                  <?php
                    if ($p['percent_off']!==null) echo number_format((float)$p['percent_off'],2).'%';
                    elseif ($p['fixed_amount']!==null) echo number_format((float)$p['fixed_amount'],2).' $';
                    else echo '-';
                  ?>
                </td>
                <td data-label="Code"><?=htmlspecialchars($p['promo_code']??'-')?></td>
                <td data-label="">
                  <form method="post" onsubmit="return confirm('Supprimer cette promotion ?')" class="row-actions">
                    <input type="hidden" name="csrf" value="<?=$csrf?>">
                    <input type="hidden" name="action" value="del_promo">
                    <input type="hidden" name="id" value="<?=htmlspecialchars($p['id'])?>">
                    <button class="btn danger" type="submit">Supprimer</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
            </tbody>
          </table>
          <?php endif; ?>
        </div>
      </div>
    </section>

  </div>

  <script src="/admin/assets/admin.js"></script>
</body>
</html>
