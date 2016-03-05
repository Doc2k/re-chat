/* Globale Vars */
/* ############################################################################################################################# */
	var usernames = {};
	var whishes = {};
	var wunschlimit=0;
	var wunschid=0;
	var anzahlwuensche=0;
	var numUsers = 0;
	var Admins = {
		"0": {
			Name: "Doc2k",
			Gender: "2"
		}, "1": {
			Name: "DJ-Bagga",
			Gender:"2"
		}, "2": {
			Name: "DareDeggel",
			Gender: "2"
		}, "3": {
			Name: "Dr. Hombre",
			Gender: "2"
		}, "4": {
			Name: "O-Liner",
			Gender: "2"
		}, "5": {
			Name: "Pike",
			Gender: "2"
		}, "6": {
			Name: "Shorty",
			Gender: "2"
		}, "7": {
			Name: "Amok Alex",
			Gender: "2"
		}, "8": {
			Name: "Frank Stoner",
			Gender: "2"
		}, "9": {
			Name: "Roni",
			Gender: "1"
		}, "10": {
			Name: "Kabel",
			Gender: "2"
		}, "11": {
			Name: "Alex & Frank",
			Gender: "2"
		}, "12": {
			Name: "Roni & Kabel",
			Gender: "0"
		}, "13": {
			Name: "Loki",
			Gender: "2"
		}
	};
/* ############################################################################################################################# */

/* Initialisierung Server */
/* ############################################################################################################################# */
	var app = require('express')();
	var http = require('http').Server(app);
	var io = require('socket.io')(http);

	app.get('/', function(req, res){
		res.sendFile(__dirname + '/chat.html');
	});
/* ############################################################################################################################# */



/* Funktionen im Socket */
/* ############################################################################################################################# */
	io.on('connection', function(socket){
		io.set('heartbeat timeout', 300000);
		io.set('heartbeat interval', 30000);
		var addedUser = false;
		var address = socket.handshake.address;

		// Wenn eine neue Message eingeht
		/* =================================================================================== */
			socket.on('chat message', function(msg, abs){
				if(abs){
					if(!socket.username){
					socket.emit('nope','nope');

						/* Benutzer aus dem Array entfernen und Anzahl verringern */
						/* --------------------------------------------------------- */
							delete usernames[abs];
							--numUsers;
						/* --------------------------------------------------------- */

						// Allen verbunden Clients gleichzeitig das Verlassen anzeigen
						/* --------------------------------------------------------- */
							io.emit('nix', '');
						/* --------------------------------------------------------- */

					}else{
						io.emit('chat message',{
							zeitpunkt: iArt_time(),
							username: socket.username,
							sex: socket.sex,
							farbe: socket.usercolor,
							weight: socket.userweight,
							style: socket.userstyle,
							istEinAdmin: socket.istEinAdmin,
							message: msg
						});
					}
				}

			});
	  	/* =================================================================================== */


		// Wenn eine neue PrivateMessage eingeht
		/* =================================================================================== */
			socket.on('private chat message', function(msg , usr, abs){

				if(!socket.username){
					socket.emit('nope','nope');

					/* Benutzer aus dem Array entfernen und Anzahl verringern */
				    /* --------------------------------------------------------- */
				      	delete usernames[abs];
				      	--numUsers;
					/* --------------------------------------------------------- */

				    // Allen verbunden Clients gleichzeitig das Verlassen anzeigen
				    /* --------------------------------------------------------- */
				   		io.emit('nix', '');
					/* --------------------------------------------------------- */
				}else{
					/* Prüfung ob benutzer noch im Chat ist  */
					/* -------------------------------------------------------------  */
						var usernorchda = false;
						for(var key in usernames) {
						   if(usernames[key].uname.toUpperCase() == usr.toUpperCase()){
								usernorchda  = true;
							}
						}
					/* -------------------------------------------------------------  */

					if(usernorchda){
						/* Nutzer ist noch im Chat -> Nachricht übermitteln  */
						/* -------------------------------------------------------------  */
							io.emit('privateMessage',{
								zeitpunkt: iArt_time(),
								username: socket.username,
								sex: socket.sex,
								farbe: socket.usercolor,
								weight: socket.userweight,
								style: socket.userstyle,
								istEinAdmin: socket.istEinAdmin,
								fuerden: usr,
								message: msg
							});
						/* -------------------------------------------------------------  */
					}else{
						/* Nutzer nicht mehr im Chat -> Fehlermeldung an absender  */
						/* -------------------------------------------------------------  */
							socket.emit('UserNotConnected', {
								zeitpunkt: iArt_time(),
								benutzer: usr,
								message: msg
							});
						/* -------------------------------------------------------------  */
					}
				}
			});
	  	/* =================================================================================== */


	  	// Wenn user die Farbe veraendert
		/* =================================================================================== */
			socket.on('usercolor', function(farbe, weight, style){
				socket.usercolor = farbe;
				socket.userweight = weight;
				socket.userstyle = style;
			});
	  	/* =================================================================================== */


	  	// Gibt Admin-Status zurück
		/* =================================================================================== */
			socket.on('binIchAdmin', function(){
				socket.emit('bistDuAdmin', socket.istEinAdmin);
			});
	  	/* =================================================================================== */




	  	// Loginversuch Client
	  	/* =================================================================================== */
	  		socket.on('add user', function (username, istAdmin, sex) {

		    	var isAdminAccount = false;
		    	var useralreadyconnected = false;

		    	/* Durchprüfen der Admins und der bereits im Chat befindlichen User */
		    	/* --------------------------------------------------------- */
			    	for(var key in Admins) {
					   if(Admins[key].Name.toUpperCase() == username.toUpperCase()){
					    	isAdminAccount = true;
					    }
					}

					for(var key in usernames) {
					   if(usernames[key].uname.toUpperCase() == username.toUpperCase()){
					    	useralreadyconnected = true;
					    }
					}
				/* --------------------------------------------------------- */

	    		if(isAdminAccount){
	    			// Anzeige, dass Username geschützt ist
			    	/* --------------------------------------------------------- */
				    	socket.emit('noAdmin', {
				     	 	username: username
				    	});
		    		/* --------------------------------------------------------- */
	    		}else if(useralreadyconnected){

		    		// Anzeige, dass Username bereits vergeben ist
			    	/* --------------------------------------------------------- */

				    	socket.emit('nologin', {
				     	 	username: username
				    	});
		    		/* --------------------------------------------------------- */

		    	}else{
		    		// Benutzername in der Socket-Session des clients speichern
			    	/* --------------------------------------------------------- */
			    		socket.username = username;
			    		socket.istEinAdmin = istAdmin;
			    		socket.sex = sex;
			    		socket.usercolor = '#eeeeee';
			    		socket.userweight = 'normal';
						socket.userstyle = 'normal';
						socket.adresse= address;
			    	/* --------------------------------------------------------- */

			    	// Willkommensnachricht anzeigen
			    	/* --------------------------------------------------------- */
				    	addedUser = true;
				    	socket.emit('login', {
				    		zeitpunkt: iArt_time(),
				     	 	username: socket.username,
				     	 	istEinAdmin: socket.istEinAdmin,
				     	 	sex: socket.sex
				    	});
		    		/* --------------------------------------------------------- */

		    		// Allen verbunden Clients gleichzeitig neuen User anzeigen
		   			/* --------------------------------------------------------- */
		   				usernames[username] = {uname: username, sex:socket.sex, istAdmin:socket.istEinAdmin, ip:socket.adresse};
				    	++numUsers;



					    socket.broadcast.emit('user joined', {
					      zeitpunkt: iArt_time(),
					      username: socket.username,
					      numUsers: numUsers,
					      istEinAdmin: socket.istEinAdmin,
					      sex: socket.sex
					    });
		    		/* --------------------------------------------------------- */

		    		/* Userliste raushauen */
		    		/* --------------------------------------------------------- */
			    		io.emit('show new userlist', usernames);
					/* --------------------------------------------------------- */

		    	}


	  		});
	  	/* =================================================================================== */

	  	// Login Admin
	  	/* =================================================================================== */
	  		socket.on('add Admin', function (username, istAdmin, sex) {
		    	var adminalreadyconnected = false;

		    	for(var key in usernames) {
					   if(usernames[key].uname.toUpperCase() == username.toUpperCase()){
					    	adminalreadyconnected = true;
					    }
					}

				if(adminalreadyconnected){

		    		// Anzeige, dass Username bereits vergeben ist
			    	/* --------------------------------------------------------- */

				    	socket.emit('noAdminLogin', {
				     	 	username: username
				    	});
		    		/* --------------------------------------------------------- */
		    		return false;
				}



		    	// Benutzername und Adminstatus in der Socket-Session des clients speichern
			    /* --------------------------------------------------------- */
			    		socket.username = username;
			    		socket.istEinAdmin = istAdmin;

			    		var userSex = 0;
			    		for(var key in Admins) {
						   if(Admins[key].Name == username){
						    	userSex=Admins[key].Gender;
						    }
						}

			    		socket.sex = userSex;
			    		socket.usercolor = '#eeeeee';
			    		socket.userweight = 'normal';
						socket.userstyle = 'normal';
						socket.adresse = address;
			    /* --------------------------------------------------------- */

			    	// Willkommensnachricht anzeigen
			    	/* --------------------------------------------------------- */
				    	addedUser = true;
				    	socket.emit('adminlogin', {
				    		zeitpunkt: iArt_time(),
				     	 	username: socket.username,
				     	 	istEinAdmin: socket.istEinAdmin
				    	});
		    		/* --------------------------------------------------------- */

		    		// Allen verbunden Clients gleichzeitig neuen User anzeigen
		   			/* --------------------------------------------------------- */
		   				usernames[username] = usernames[username] = {uname: username, sex:socket.sex, istAdmin:socket.istEinAdmin, ip:socket.adresse};
				    	++numUsers;



					    socket.broadcast.emit('user joined', {
					      zeitpunkt: iArt_time(),
					      username: socket.username,
					      numUsers: numUsers,
					      istEinAdmin: socket.istEinAdmin
					    });
		    		/* --------------------------------------------------------- */

		    		/* Userliste raushauen */
		    		/* --------------------------------------------------------- */
			    		io.emit('show new userlist', usernames);
					/* --------------------------------------------------------- */

	  		});
	  	/* =================================================================================== */


		/* Disconnect vom Server */
		/* =================================================================================== */
			socket.on('disconnect', function () {

				 if(addedUser) {
				    /* Benutzer aus dem Array entfernen und Anzahl verringern */
				    /* --------------------------------------------------------- */
				      	delete usernames[socket.username];
				      	--numUsers;
					/* --------------------------------------------------------- */

				    // Allen verbunden Clients gleichzeitig das Verlassen anzeigen
				    /* --------------------------------------------------------- */
				   		io.emit('user left', {
				   			zeitpunkt: iArt_time(),
				        	username: socket.username,
				        	numUsers: numUsers,
				        	istEinAdmin: socket.istEinAdmin
				      	});
					/* --------------------------------------------------------- */

					/* Userliste raushauen */
		    		/* --------------------------------------------------------- */
			    		io.emit('show new userlist', usernames);
					/* --------------------------------------------------------- */
			    }
			});
		/* =================================================================================== */


		/* Client Kick */
		/* =================================================================================== */
			socket.on('KickUser', function (username) {
				socket.broadcast.emit('userkick', username);
			});
		/* =================================================================================== */

		/* Namens-Abfrage */
		/* =================================================================================== */
			socket.on('WerBinIch', function () {
				if(socket.username){
					socket.emit('werBinIch', socket.username);
				}else{
					socket.emit('nope','nope');

				    // Allen verbunden Clients gleichzeitig das Verlassen anzeigen
				    /* --------------------------------------------------------- */
				   		io.emit('nix', '');
					/* --------------------------------------------------------- */
				}
			});
		/* =================================================================================== */

		/* Gibt das aktuelle wunschlimit zurück */
		/* =================================================================================== */
			socket.on('getWunschLimit', function(){
				socket.emit('Wunschlimit', wunschlimit);
			});
		/* =================================================================================== */

		/* Neues Wunschlimit übernehmen */
		/* =================================================================================== */
			socket.on('neuesWunschlimit', function(limit){
				wunschlimit = limit;
				io.emit('Wunschlimit', wunschlimit);
			});
		/* =================================================================================== */

		/* Gibt die Aktuelle Wunschliste zurück */
		/* =================================================================================== */
			socket.on('zeigewuensche', function(){
				socket.emit('Wunschliste', whishes);
			});
		/* =================================================================================== */

		/* Neuen Musikwunsch übernehmen */
		/* =================================================================================== */
			socket.on('neuerWunsch', function(bandname, songname, greeting){
				wunschid++;
				whishes[wunschid] = {id: wunschid, wstatus: '0', band:bandname, song:songname, greet:greeting, user:socket.username};

				io.emit('Wunschliste', whishes);
			});
		/* =================================================================================== */

		/* Status von Musikwunsch verändern */
		/* =================================================================================== */
			socket.on('statuswechsel', function(wID, wST){
				Object.defineProperty(whishes[wID], 'wstatus' ,{value: wST, writable: true});
				io.emit('Wunschliste', whishes);
			});
		/* =================================================================================== */

		/* Musikwunsch erledigen (entfernen) */
		/* =================================================================================== */
			socket.on('wunschFertig', function(wID){
				delete whishes[wID];
				io.emit('Wunschliste', whishes);
			});
		/* =================================================================================== */




	});
/* ############################################################################################################################# */


/* Listener auf port 3000 */
/* ############################################################################################################################# */
	http.listen(3000, function(){
		console.log('Server läuft auf Port 3000');
		console.log(' ');
		console.log('############################################################################');
		console.log('################## DIESES FENSTER NICHT SCHLIESSEN!!!! #####################');
		console.log('############################################################################');
	});
/* ############################################################################################################################# */

function iArt_time(){
	var jetzt = new Date();
	//var Std = jetzt.getHours()+1;
	var Std = jetzt.getHours();
	var Min = jetzt.getMinutes();
	var StdAusgabe = ((Std < 10) ? "0" + Std : Std);
	var MinAusgabe = ((Min < 10) ? "0" + Min : Min);
	return 	StdAusgabe+':'+MinAusgabe;
}
