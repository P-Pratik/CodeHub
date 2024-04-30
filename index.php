<?php
require 'config/database.php';

$baseUrl = 'https://leetcode.com/problems/';

$lccollection = (new MongoDB\Client($uri))->CodeHub->Leetcode;
$query = $lccollection->find([], ['limit' => 10]);

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home Page</title>
</head>
<body>
    <div class="problems">
        <h1>Leetcode Problems</h1>
        <table>
            <tr>
                <th>Problem Name</th>
                <th>Difficulty</th>
                <th>URL</th>
            </tr>
            <?php foreach ($query as $problem): ?>
                <tr>
                    <td><?php echo $problem->title; ?></td>
                    <td><?php echo $problem->difficulty; ?></td>

                    <?php
                    $problemlink = $baseUrl . $problem->titleSlug;
                    ?>

                    <td><a href="<?php echo $problemlink; ?>">Link</a></td>
                </tr>
            <?php endforeach; ?>
        </table>

    </div>
</body>
</html>