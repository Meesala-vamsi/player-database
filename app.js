let expressServer = require("express");
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = require("sqlite");
const appServer = expressServer();
appServer.use(expressServer.json());
let dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;
console.log(dbPath);
let initializeDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    appServer.listen(3000);
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

initializeDB();

// Get All players From Server.....

appServer.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `
    SELECT * FROM cricket_team;
    `;
  const convertDbObjectToResponseObject = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  const getPlayers = await db.all(getAllPlayersQuery);

  response.send(
    getPlayers.map((eachArray) => convertDbObjectToResponseObject(eachArray))
  );
});

// Create a Player in a server....

appServer.post("/players/", async (request, response) => {
  let requestBody = request.body;
  let { playerName, jerseyNumber, role } = requestBody;

  let createPlayerQuery = `
    INSERT INTO cricket_team
    (player_name,jersey_number,role)
    VALUES
    (${playerName},${jerseyNumber},${role});
    `;
  let cricketPlayer = await db.run(createPlayerQuery);
  let playerId = cricketPlayer.lastID;
  console.log(playerId);
  response.send("Player Added to Team");
});

//Access A player From Server.....

appServer.get("/players/:playerId", async (request, response) => {
  let { playerId } = request.params;
  let getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId};
    `;
  const hello = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };
  let getPlayer = await db.all(getPlayerQuery);

  response.send(getPlayer.map((eachArray) => hello(eachArray)));
});

// Update a player in a server.....

appServer.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  let requestBody = request.body;
  console.log(requestBody);
  const { playerName, jerseyNumber, role } = requestBody;

  /*const update = (dbObject) => {
    return {
      playerId: dbObject.player_id,
      playerName: dbObject.player_name,
      jerseyNumber: dbObject.jersey_number,
      role: dbObject.role,
    };
  };*/

  let updatePlayerQuery = `
    UPDATE cricket_team
    SET player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
    WHERE player_id = ${playerId};
    `;
  let updatePlayer = await db.run(updatePlayerQuery);
  update(updatePlayer);
  response.send("Player Details Updated");
});

// Delete the Player From Server.....
appServer.delete("/players/:playerId", async (request, response) => {
  let { playerId } = request.params;
  let deletePlayerQuery = `
    DELETE FROM cricket_team WHERE player_id = ${playerId};
    `;

  let deletePlayer = await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = appServer;
