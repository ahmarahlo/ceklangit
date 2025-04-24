<?php
$host = "localhost";
$user = "root";
$pass = "";
$dbname = "weather_app";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

$city = $_GET['city'] ?? '';

if ($city) {
    $stmt = $conn->prepare("SELECT * FROM weather_data WHERE city = ? AND last_updated > NOW() - INTERVAL 10 MINUTE");
    $stmt->bind_param("s", $city);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo json_encode($result->fetch_assoc());
    } else {
        // Kalau nggak ada di database, ambil dari API
        $apiKey = "API_KEY_LO";
        $apiUrl = "http://api.weatherapi.com/v1/current.json?key=$apiKey&q=" . urlencode($city);

        $response = file_get_contents($apiUrl);
        $data = json_decode($response, true);

        if ($data) {
            $stmt = $conn->prepare("INSERT INTO weather_data (city, temperature, condition_code, condition_text) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("sdis", $city, $data['current']['temp_c'], $data['current']['condition']['code'], $data['current']['condition']['text']);
            $stmt->execute();
        }
        echo $response;
    }
}

$conn->close();
?>
