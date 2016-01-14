<?php
	ini_set('display_errors',1);
	ini_set('display_startup_errors',1);
	error_reporting(E_ERROR | E_PARSE);
	header("Content-Type: text/plain");

	function StartOKResponse () {
		echo("{\"responseType\":\"OK\", \"response\":");
	}

	function EndResponse() {
		echo("}");
	}

	function ErrorResponse($s) {
		echo("{\"responseType\":\"ERROR\", \"response\":\"".$s."\"}");
	}

	$action = $_GET["action"];
	$id = $_GET["id"];
	$data = $_POST["data"];
	$note = $_POST["note"];
	$statement;

	//hardcoded credentials save lives!
	$hostname = "mightnot.work";
	$username = "mmoo";
	$password = "a series of parallel lines";
	$database = "mmoo";

	//connect
	$sqlConnection = new mysqli($hostname, $username, $password, $database);
	//check connection
	if ($sqlConnection->connect_error) {
		die("MySQL connection failed: " . $sqlConnection->connect_error);
	}

	if ($action == "getSkeletonList") {
		$statement = "SELECT skeleton_id, note FROM d_Skeleton;";
		$result = $sqlConnection->query($statement);
		$resNum = 0;

		StartOKResponse();
		echo("{");

		while($row = $result->fetch_assoc()) {
			if ($resNum > 0) {
				echo(",");
			}
			echo("\"".$row["skeleton_id"]."\":\"".$row["note"]."\"");
			$resNum++;
		}

		echo("}");
		EndResponse();

		//$statement->close();

	} else if ($action == "getSkeleton") {
		if (!isset($id)) {
			ErrorResponse("No id provided.");
		} else {
			$statement = $sqlConnection->prepare("SELECT data FROM d_Skeleton WHERE skeleton_id = ?");
			$statement->bind_param("i", $id);
			$statement->execute();
			
			$statement->bind_result($data);
			$statement->fetch();

			StartOKResponse();
			echo($data);
			EndResponse();

			$statement->close();
		}

	} else if ($action == "setSkeleton") {
		if (isset($id)) {
			//update

			if (!(isset($data) || isset($note))) {
				ErrorResponse("No data or note provided.");
			}

			$statementStr = "UPDATE d_Skeleton SET ";

			if (isset($data)) {
				$statementStr = $statementStr . "data=?";
				if (isset($note)) {
					$statementStr = $statementStr . ", ";
				}
			}
			if (isset($note)) {
				$statementStr = $statementStr . "note=?";
			}

			$statementStr = $statementStr . " WHERE skeleton_id=?"
			$statement = $sqlConnection->prepare($statementStr);

			if (isset($data) && isset($note)) {
				$statement->bind_param("ssi", $data, $note, $id);
			} else if (isset($data)) {
				$statement->bind_param("si", $data, $id);
			} else {
				$statement->bind_param("si", $note, $id);
			}

			if ($statement->execute()) {
				StartOKResponse();
				echo("Updated.");
				EndResponse();
			} else {
				ErrorResponse("SQL error.");
			}

		} else {
			//insert

			if (!isset($data)) {
				ErrorResponse("No data provided.");
			}
			if (!isset($note)) {
				$note = "Skeleton";
			}

			$statement = $sqlConnection->prepare("INSERT INTO d_Skeleton (note, data) VALUES (?, ?)");
			$statement->bind_param("ss", $note, $data);

			if ($statement->execute()) {
				StartOKResponse();
				echo($sqlConnection->insert_id);
				EndResponse();
			} else {
				ErrorResponse("SQL error.");
			}
		}

	} else if ($action == "deleteSkeleton") {
		if (!isset($id)) {
			ErrorResponse("No id provided.");
		} else {
			$statement = $sqlConnection->prepare("DELETE FROM d_Skeleton WHERE skeleton_id=?");
			$statement->bind_param("i", $id);

			if ($statement->execute()) {
				StartOKResponse();
				echo("Deleted.");
				EndResponse();
			} else {
				ErrorResponse("SQL error.");
			}
		}

	} else {
		ErrorResponse("Invalid action.");
	}

	$sqlConnection->close();
?>