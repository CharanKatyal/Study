<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CK Hero Content</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>
    <header id="main-header">
        <button id="back-btn" class="hidden"><i class="fas fa-arrow-left"></i> Back</button>
        <h1 id="header-title">Home</h1>
    </header>

    <main id="app-container">
        <!-- Browser View for files and folders -->
        <section id="browser-view">
            <div id="items-container"></div>
        </section>

        <!-- Content View for displaying file content -->
        <section id="content-view" class="hidden">
            <div id="post-content"></div>
        </section>
    </main>

    <script src="main.js" type="module"></script>
</body>
</html>