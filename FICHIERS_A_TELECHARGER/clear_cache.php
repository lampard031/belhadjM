<?php
// Script pour vider le cache PHP (OPcache)
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Clear PHP Cache - Triple 7</title>
    <style>
        body { font-family: Arial; padding: 20px; background: #f5f5f5; }
        .box { background: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 20px auto; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { color: #10b981; font-weight: bold; }
        .error { color: #ef4444; font-weight: bold; }
        .info { background: #e0f2fe; padding: 10px; border-radius: 4px; margin: 10px 0; }
        h1 { color: #1f2937; }
        pre { background: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="box">
        <h1>🧹 Clear PHP Cache</h1>
        
        <?php
        $cleared = false;
        $messages = [];
        
        // 1. Clear OPcache
        if (function_exists('opcache_reset')) {
            if (opcache_reset()) {
                $messages[] = ['type' => 'success', 'msg' => '✅ OPcache vidé avec succès!'];
                $cleared = true;
            } else {
                $messages[] = ['type' => 'error', 'msg' => '❌ Échec du vidage OPcache'];
            }
        } else {
            $messages[] = ['type' => 'info', 'msg' => 'ℹ️ OPcache n\'est pas activé ou disponible'];
        }
        
        // 2. Clear Realpath Cache
        clearstatcache(true);
        $messages[] = ['type' => 'success', 'msg' => '✅ Realpath cache vidé'];
        
        // 3. Info sur le fichier index.php
        $indexFile = __DIR__ . '/index.php';
        if (file_exists($indexFile)) {
            $fileInfo = [
                'Taille' => filesize($indexFile) . ' bytes',
                'Modifié le' => date('Y-m-d H:i:s', filemtime($indexFile)),
                'Permissions' => substr(sprintf('%o', fileperms($indexFile)), -4)
            ];
            $messages[] = ['type' => 'info', 'msg' => 'ℹ️ Info index.php:<br>' . 
                          implode('<br>', array_map(fn($k,$v) => "  • $k: $v", array_keys($fileInfo), $fileInfo))];
        }
        
        // Afficher les messages
        foreach ($messages as $msg) {
            echo "<div class='info {$msg['type']}'>{$msg['msg']}</div>";
        }
        
        if ($cleared) {
            echo "<div class='info success'><strong>🎉 Cache PHP vidé! Testez maintenant:</strong></div>";
            echo "<div class='info'>";
            echo "1. <a href='/api/promotions.php?flat=1' target='_blank'>Tester l'API Promotions</a><br>";
            echo "2. <a href='/' target='_blank'>Retourner au site</a> (CTRL+F5)<br>";
            echo "3. Vérifier que l'API retourne <code>[{...}]</code> et non <code>{\"0\":{...}}</code>";
            echo "</div>";
        }
        ?>
        
        <div class="info">
            <strong>📋 Prochaines étapes:</strong><br>
            1. Testez l'API: <code>/api/promotions.php?flat=1</code><br>
            2. Si toujours format objet {"0":...}, le fichier n'a pas été bien uploadé<br>
            3. Si format tableau [{...},...], CTRL+F5 sur le site
        </div>
        
        <div class="info">
            <strong>🔄 Recharger cette page pour vider à nouveau</strong><br>
            <button onclick="location.reload()">Vider le cache à nouveau</button>
        </div>
    </div>
</body>
</html>
