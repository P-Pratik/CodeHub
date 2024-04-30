
<?php

use MongoDB\Driver\ServerApi;
require 'vendor/autoload.php';

$uri = 'mongodb+srv://CodehubAdmin:egS7FPErebzzrkv1@cluster0.6x2hp7m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

$apiVersion = new ServerApi(ServerApi::V1);
// Create a new client and connect to the server
$client = new MongoDB\Client($uri, [], ['serverApi' => $apiVersion]);
try {
    // Send a ping to confirm a successful connection
    $client->selectDatabase('CodeHub')->command(['ping' => 1]);
    // echo "Pinged your deployment. You successfully connected to MongoDB!\n";
} catch (Exception $e) {
    // printf($e->getMessage());
}

?>