<?php
// This is a placeholder file. In a real-world scenario, you might have PHP logic here
// to handle user sessions or other server-side tasks for the admin panel.
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel</title>
    <!-- Local Libraries -->
    <link rel="stylesheet" href="Assets/Libraries/font-awesome.min.css">
    <link href="Assets/Libraries/quill.snow.css" rel="stylesheet">
    <link href="Assets/Libraries/katex.min.css" rel="stylesheet">
    <link rel="stylesheet" href="admin.css">
</head>
<body>
    <div id="admin-container">
        <header id="admin-header">
            <h1>Content Management</h1>
        </header>

        <!-- This main container will hold both views -->
        <main id="admin-main">

            <!-- Explorer View -->
            <section id="explorer-section">
                <div class="explorer-header">
                    <button id="explorer-back-btn" title="Go back"><i class="fas fa-arrow-left"></i></button>
                    <input type="text" id="explorer-path-input" placeholder="Enter path and press Enter...">
                </div>
                <div id="explorer-controls">
                    <button id="create-folder-btn"><i class="fas fa-folder-plus"></i> New Folder</button>
                    <button id="create-file-btn"><i class="fas fa-file-plus"></i> New File</button>
                    <button id="delete-btn"><i class="fas fa-trash-alt"></i> Delete</button>
                    <button id="move-up-btn"><i class="fas fa-arrow-up"></i> Move Up</button>
                    <button id="move-down-btn"><i class="fas fa-arrow-down"></i> Move Down</button>
                </div>
                <div id="explorer-view"></div>
                <div id="publish-section">
                    <button id="publish-btn"><i class="fas fa-upload"></i> Publish All Changes</button>
                </div>
            </section>

            <!-- Editor View (initially hidden) -->
            <section id="editor-section" class="hidden">
                <form id="file-editor-form">
                    <div class="editor-header">
                        <button type="button" id="editor-back-btn" title="Go to parent folder"><i class="fas fa-arrow-left"></i></button>
                        <input type="text" id="current-path-display">
                    </div>
                    <div id="editor"></div>
                    <div id="editor-controls">
                        <button type="submit" id="save-btn"><i class="fas fa-save"></i> Save File</button>
                        <button type="button" id="back-to-explorer-btn"><i class="fas fa-undo-alt"></i> Back to Explorer</button>
                    </div>
                </form>
            </section>

        </main>
    </div>
    <!-- Local Libraries -->
    <script src="Assets/Libraries/quill.js"></script>
    <script src="Assets/Libraries/quill-blot-formatter.min.js"></script>
    <script src="Assets/Libraries/katex.min.js"></script>
    <script src="admin.js" type="module"></script>
</body>
</html>