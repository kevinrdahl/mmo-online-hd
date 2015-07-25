<?php
	ini_set('display_errors', 'On');
	error_reporting(E_ALL | E_STRICT);

	function StartOKResponse () {
		echo("{\"reponseType\":\"OK\", \"response\":");
	}

	function EndResponse() {
		echo("}");
	}

	function ErrorResponse($s) {
		echo("");
	}

	$action = $_GET["action"];
	$id = $_GET["id"];
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
		$result = sqlConnection->query($statement);
		$resNum = 0;

		StartOKResponse();
		echo("{");

		while($row = $result->fetch_assoc()) {
			if ($resNum > 0) {
				echo(",");
			}
			echo("\"".$row["id"]."\":\"".$row["note"]."\"");
			$resNum++;
		}

		echo("}");
		EndResponse();

		$statement->close();

	} else if ($action == "getSkeleton") {
		$statement = $sqlConnection->prepare("SELECT data FROM d_Skeleton WHERE skeleton_id = ?");
		$statement->bind_param("i", $id);
		$statement->execute();
		$statement->bind_result($data);

		StartOKResponse();
		echo($data);
		EndResponse();

	} else {
		ErrorResponse("Invalid action.");
	}

	$sqlConnection->close();
?>