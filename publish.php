<?php
// Check if the request is a POST request and if the content is not empty
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['content'])) {
    // The content from the admin panel
    $content = $_POST['content'];

    // The target file to be updated
    $filePath = __DIR__ . '/content-data.js';

    // Prepare the final content for the JavaScript file
    $fileContent = "export const fileSystemData = " . $content . ";";

    // Write the content to the file
    // The file_put_contents function is a safe and efficient way to write to files.
    if (file_put_contents($filePath, $fileContent) !== false) {
        // If the write is successful, send a success response
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Content published successfully.']);
    } else {
        // If the write fails, send a server error response
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to write to file. Check server permissions.']);
    }
} else {
    // If the request is not valid, send a bad request response
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
}
?>