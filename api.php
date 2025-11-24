<?php
// public/api.php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../src/db.php';

$pdo = DB::getConnection();

$action = $_REQUEST['action'] ?? '';

function json($data) {
    echo json_encode($data);
    exit;
}

try {
    if ($action === 'getTasks') {
        $date = $_GET['date'] ?? null;
        if (!$date) json(['error' => 'Missing date']);
        $stmt = $pdo->prepare("SELECT * FROM tasks WHERE due_date = :due_date ORDER BY FIELD(priority, 'high','medium','low'), due_date, id");
        $stmt->execute([':due_date' => $date]);
        $tasks = $stmt->fetchAll();
        json(['tasks' => $tasks]);
    }

    if ($action === 'getTasksRange') {
        $from = $_GET['from'] ?? null;
        $to = $_GET['to'] ?? null;
        if (!$from || !$to) json(['error' => 'Missing from/to']);
        $stmt = $pdo->prepare("SELECT * FROM tasks WHERE due_date BETWEEN :from AND :to ORDER BY due_date, FIELD(priority, 'high','medium','low')");
        $stmt->execute([':from' => $from, ':to' => $to]);
        json(['tasks' => $stmt->fetchAll()]);
    }

    if ($action === 'addTask' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $title = trim($data['title'] ?? '');
        if ($title === '') json(['error' => 'Title required']);
        $sql = "INSERT INTO tasks (title, description, due_date, priority, category, status) VALUES (:title, :description, :due_date, :priority, :category, :status)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':title' => $title,
            ':description' => $data['description'] ?? '',
            ':due_date' => $data['due_date'] ?? date('Y-m-d'),
            ':priority' => in_array($data['priority'] ?? 'low', ['low','medium','high']) ? $data['priority'] : 'low',
            ':category' => $data['category'] ?? 'general',
            ':status' => ($data['status'] ?? 'pending')
        ]);
        json(['success' => true, 'id' => $pdo->lastInsertId()]);
    }

    if ($action === 'updateTask' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
        if (!$id) json(['error' => 'Missing id']);
        $sql = "UPDATE tasks SET title=:title, description=:description, due_date=:due_date, priority=:priority, category=:category, status=:status WHERE id=:id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':title' => $data['title'] ?? '',
            ':description' => $data['description'] ?? '',
            ':due_date' => $data['due_date'] ?? date('Y-m-d'),
            ':priority' => in_array($data['priority'] ?? 'low', ['low','medium','high']) ? $data['priority'] : 'low',
            ':category' => $data['category'] ?? 'general',
            ':status' => ($data['status'] ?? 'pending'),
            ':id' => $id
        ]);
        json(['success' => true]);
    }

    if ($action === 'deleteTask' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
        if (!$id) json(['error' => 'Missing id']);
        $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = :id");
        $stmt->execute([':id' => $id]);
        json(['success' => true]);
    }

    if ($action === 'toggleComplete' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $id = intval($data['id'] ?? 0);
        if (!$id) json(['error' => 'Missing id']);
        // fetch current
        $stmt = $pdo->prepare("SELECT status FROM tasks WHERE id=:id");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        if (!$row) json(['error' => 'Task not found']);
        $new = $row['status'] === 'completed' ? 'pending' : 'completed';
        $stmt = $pdo->prepare("UPDATE tasks SET status=:status WHERE id=:id");
        $stmt->execute([':status' => $new, ':id' => $id]);
        json(['success' => true, 'status' => $new]);
    }

    json(['error' => 'Invalid action']);
} catch (Exception $e) {
    http_response_code(500);
    json(['error' => $e->getMessage()]);
}
