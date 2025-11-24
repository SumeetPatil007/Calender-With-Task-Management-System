<?php
// public/index.php
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Calendar & Tasks</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="assets/css/styles.css" rel="stylesheet">
</head>
<body class="bg-light">
<div class="container py-4">
  <div class="d-flex justify-content-between align-items-center mb-3">
    <h1 class="h4">Calendar & Tasks</h1>
    <div>
      <button id="prevMonth" class="btn btn-sm btn-outline-primary">&lt;</button>
      <span id="monthLabel" class="mx-2 fw-bold"></span>
      <button id="nextMonth" class="btn btn-sm btn-outline-primary">&gt;</button>
      <button id="todayBtn" class="btn btn-sm btn-secondary ms-2">Today</button>
    </div>
  </div>

  <div class="row">
    <div class="col-lg-8">
      <div id="calendar" class="card p-3">
        <div id="calendarGrid" class="calendar-grid"></div>
      </div>
    </div>

    <div class="col-lg-4">
      <div class="card p-3">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h5 id="selectedDateLabel" class="mb-0">Tasks</h5>
          <button id="addTaskBtn" class="btn btn-sm btn-primary">Add Task</button>
        </div>
        <div id="tasksList" class="list-group"></div>
      </div>
    </div>
  </div>
</div>

<!-- task modal -->
<div class="modal fade" id="taskModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <form id="taskForm" class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Task</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="taskId" />
        <div class="mb-2">
          <label class="form-label">Title</label>
          <input id="title" class="form-control" required />
        </div>
        <div class="mb-2">
          <label class="form-label">Description</label>
          <textarea id="description" class="form-control" rows="3"></textarea>
        </div>
        <div class="row">
          <div class="col">
            <label class="form-label">Due date</label>
            <input id="due_date" type="date" class="form-control" required />
          </div>
          <div class="col">
            <label class="form-label">Priority</label>
            <select id="priority" class="form-select">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div class="mb-2 mt-2">
          <label class="form-label">Category</label>
          <input id="category" class="form-control" />
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" id="deleteTaskBtn" class="btn btn-danger me-auto">Delete</button>
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" class="btn btn-primary">Save task</button>
      </div>
    </form>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="assets/js/app.js"></script>
</body>
</html>
