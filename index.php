<?php
// Read the raw content of the JavaScript data file
$jsContent = file_get_contents(__DIR__ . '/content-data.js');

// Clean the content to make it valid JSON
// 1. Remove "export const fileSystemData = " from the beginning
$jsonContent = str_replace('export const fileSystemData = ', '', $jsContent);
// 2. Remove the trailing semicolon if it exists
if (substr(trim($jsonContent), -1) === ';') {
    $jsonContent = substr(trim($jsonContent), 0, -1);
}

// Decode the JSON string into a PHP associative array
$fileSystem = json_decode($jsonContent, true);

// Determine the initial content to display.
// Default to the "Welcome.md" file's content.
$initialContent = '<p>Welcome! Select a file from the explorer to view its content.</p>';
if (isset($fileSystem['Welcome.md']['content'])) {
    $initialContent = $fileSystem['Welcome.md']['content'];
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dynamic Content Viewer</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <script>
        // Inject the file system data from PHP into a global JavaScript variable
        window.fileSystemData = <?php echo json_encode($fileSystem); ?>;
    </script>
</head>
<body>
    <div id="app-container">
        <header id="app-header">
            <h1>Web Content Viewer</h1>
        </header>
        <main id="app-main">
            <aside id="explorer-panel">
                <h2><i class="fas fa-compass"></i> Explorer</h2>
                <div id="explorer-view"></div>
            </aside>
            <section id="content-panel">
                <div id="content-header">
                    <h2 id="content-title"><i class="fas fa-file-alt"></i> Welcome.md</h2>
                </div>
                <div id="content-body">
                    <?php echo $initialContent; // Server-side render of the initial content ?>
                </div>
            </section>
        </main>
    </div>
    <script src="main.js" type="module"></script>
</body>
</html>
