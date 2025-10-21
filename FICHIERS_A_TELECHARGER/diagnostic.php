<?php
// Script de diagnostic pour vérifier index.php
header('Content-Type: text/html; charset=utf-8');

$indexPath = __DIR__ . '/index.php';
?>
<!DOCTYPE html>
<html>
<head>
    <title>Diagnostic index.php</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1f2937; color: #f3f4f6; }
        .box { background: #374151; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .success { color: #10b981; }
        .error { color: #ef4444; }
        .warning { color: #f59e0b; }
        pre { background: #1f2937; padding: 15px; border-radius: 4px; overflow-x: auto; white-space: pre-wrap; }
        h2 { color: #60a5fa; }
    </style>
</head>
<body>
    <h1>🔍 Diagnostic index.php</h1>
    
    <div class="box">
        <h2>1. Fichier existe?</h2>
        <?php if (file_exists($indexPath)): ?>
            <span class="success">✅ OUI - Fichier trouvé</span>
        <?php else: ?>
            <span class="error">❌ NON - Fichier introuvable!</span>
        <?php endif; ?>
    </div>
    
    <?php if (file_exists($indexPath)): ?>
    <div class="box">
        <h2>2. Info fichier</h2>
        <pre>Taille: <?= filesize($indexPath) ?> bytes
Modifié: <?= date('Y-m-d H:i:s', filemtime($indexPath)) ?>
Permissions: <?= substr(sprintf('%o', fileperms($indexPath)), -4) ?>
Readable: <?= is_readable($indexPath) ? '✅ Oui' : '❌ Non' ?></pre>
    </div>
    
    <div class="box">
        <h2>3. Premières lignes (50 premiers caractères)</h2>
        <pre><?php
        $handle = fopen($indexPath, 'r');
        $first50 = fread($handle, 50);
        fclose($handle);
        echo htmlspecialchars($first50);
        ?></pre>
        <?php if (strpos($first50, '<?php') === false): ?>
            <span class="error">⚠️ ATTENTION: Le fichier ne commence PAS par &lt;?php</span>
        <?php else: ?>
            <span class="success">✅ Commence bien par &lt;?php</span>
        <?php endif; ?>
    </div>
    
    <div class="box">
        <h2>4. Recherche "array_values" dans le fichier</h2>
        <?php
        $content = file_get_contents($indexPath);
        $count = substr_count($content, 'array_values');
        ?>
        <pre>Occurrences de "array_values": <?= $count ?></pre>
        <?php if ($count >= 2): ?>
            <span class="success">✅ Trouvé <?= $count ?> fois (devrait être 2)</span>
        <?php else: ?>
            <span class="error">❌ Devrait apparaître 2 fois! (lignes 172 et 177)</span>
            <span class="warning">→ Le fichier n'a PAS été correctement uploadé!</span>
        <?php endif; ?>
    </div>
    
    <div class="box">
        <h2>5. Lignes autour de "promotions" (contexte)</h2>
        <pre><?php
        $lines = explode("\n", $content);
        $found = false;
        foreach ($lines as $i => $line) {
            if (strpos($line, "resource === 'promotions'") !== false) {
                $start = max(0, $i - 2);
                $end = min(count($lines), $i + 60);
                echo "Lignes " . ($start+1) . " à " . ($end+1) . ":\n\n";
                for ($j = $start; $j < $end; $j++) {
                    $lineNum = $j + 1;
                    $lineContent = htmlspecialchars($lines[$j]);
                    // Highlight array_values
                    if (strpos($lines[$j], 'array_values') !== false) {
                        echo "<span class='success'>$lineNum: $lineContent</span>\n";
                    } else {
                        echo "$lineNum: $lineContent\n";
                    }
                }
                $found = true;
                break;
            }
        }
        if (!$found) {
            echo "<span class='error'>Section promotions introuvable!</span>";
        }
        ?></pre>
    </div>
    
    <div class="box">
        <h2>6. Verdict</h2>
        <?php
        $hasPhpTag = strpos($first50, '<?php') !== false;
        $hasArrayValues = $count >= 2;
        
        if ($hasPhpTag && $hasArrayValues) {
            echo "<span class='success'>✅ Le fichier semble CORRECT!</span><br>";
            echo "<span class='warning'>→ Si l'API retourne toujours un objet, c'est un problème de CACHE PHP</span><br>";
            echo "<span class='warning'>→ Uploadez clear_cache.php et exécutez-le!</span>";
        } else {
            echo "<span class='error'>❌ Le fichier est INCORRECT ou INCOMPLET!</span><br>";
            if (!$hasPhpTag) {
                echo "<span class='error'>→ Manque la balise &lt;?php au début</span><br>";
            }
            if (!$hasArrayValues) {
                echo "<span class='error'>→ Manque array_values() (devrait être 2 fois)</span><br>";
            }
            echo "<span class='warning'>→ Réuploadez index_COMPLET.php!</span>";
        }
        ?>
    </div>
    <?php endif; ?>
    
    <div class="box">
        <h2>🔗 Actions</h2>
        <a href="/api/promotions.php?flat=1" target="_blank">Tester l'API</a> |
        <a href="/" target="_blank">Retour au site</a> |
        <a href="clear_cache.php">Vider cache PHP</a>
    </div>
</body>
</html>
