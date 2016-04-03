/* Vars zur Steuerung */
    	/* ############################################################################################################ */
			document.domain = 'radio-emergency.de';
	    	var username;
	  		var connected = false;
	  		var chatinited= false;
	  		var isteiner =0;
	  		var privateTabPanelOpen=false;
			var privatTabScollTimeout;
			var privateChatting=false;
			var privateChattingWith='';
			var soundsDisabled = false;
			var soundsmooving = false;
			var isInInputField = false;
			var wunschlimit =0;
			var wunschzaehler=0;
  		/* ############################################################################################################ */

		/* Socket-Verbindung herstellen  */
				/* ============================================================================================  */
	      			var socket = io();
	      		/* ============================================================================================  */

  		/* Document ready() */
  		/* ############################################################################################################ */
			jQuery(document).ready(function(){

				/* Zurück-Effekt im Browserfenster durch Backspace verhindern  */
				/* ============================================================================================  */
					jQuery(document).keydown(function(e) {
						if(e.which ==8){
							if(!isInInputField){
								return false;
							}
						}
					});

					/* Ausnahme-Inputs (Text) in denen Backspace funzen soll sollen  */
					/* -------------------------------------------------------------  */
						jQuery('input:text, textarea').focus(function(){
							isInInputField=true;
						}).blur(function(){
							isInInputField=false;
						});
					/* -------------------------------------------------------------  */
				/* ============================================================================================  */



	      		/* Login durch Admin oder Anmeldeformular zeigen  */
	      		/* ============================================================================================  */
					jQuery('#iArt_usersessionCheck').load(function(){
						var istWirklichderAdmin = jQuery('#iArt_usersessionCheck').contents().find('#iArt_sessionUser').html();
						if(istWirklichderAdmin != "null" && istWirklichderAdmin != ""){
							/* Admin-Session Vorhanden -> Admin-Login mit Namen aus Session  */
							/* -------------------------------------------------------------  */
								socket.emit('add Admin', istWirklichderAdmin, 1);
							/* -------------------------------------------------------------  */
						}else{
							/* Normaler User  */
							/* -------------------------------------------------------------  */
								jQuery('#reChatLoginBlocker').fadeIn();jQuery('#reUsername').focus();
							/* -------------------------------------------------------------  */
						}
					});
				/* ============================================================================================  */


	      		/* Loginversuch durch client  */
	      		/* ============================================================================================  */
		      		jQuery('#iArt_chatLoginForm').submit(function(){
		      			username = iArt_ChangeMarkup(jQuery('#reUsername').val(), false);
		      			sex = jQuery('#iArt_sex').val();

						/* Wenn ein Benutzername eingegeben wurde  */
						/* -------------------------------------------------------------  */
					    	if (username) {
					      		/* Benutzernamen an Server übergeben  */
					      		/* -------------------------------------------------------------  */
					      			socket.emit('add user', username, 0, sex); /* (label, benutzername, istAdmin, geschlecht) */
					      		/* -------------------------------------------------------------  */
					    	}
					    /* -------------------------------------------------------------  */
		      			return false;
		      		});
		      	/* ============================================================================================  */


		      	/* Login durch Admin erfolgreich  */
	      		/* ============================================================================================  */
					socket.on('adminlogin', function (data) {
					    connected = true;
					    jQuery('#iArt_userNameBackup').val(data.username);
					    isteiner=1; /* Adminstatus für die ersten 20 Sek vergeben  */

						/* Erste ausrichtung der höhen von Chatfenster und Userliste vornehmen  */
						/* -------------------------------------------------------------  */
							jQuery('#iArt_chatmessageContainer, #reChatUsers').css('height', (jQuery(window).innerHeight()-70)+'px');
							jQuery('#iArt_userListContainer, #iArt_smileyInnerCont').css('height', ((jQuery(window).innerHeight()-70)-37)+'px');
						/* -------------------------------------------------------------  */

						/* Begrüßung einbinden und Chat anzeigen  */
						/* -------------------------------------------------------------  */
							jQuery('#messages').append(jQuery('<div>').addClass('iArtChatMessageItem').addClass('reChatInfo').html('('+data.zeitpunkt+') Willkommen '+data.username+' im Radio-Emergency.de Chat'));
				      		jQuery('#iArt_chatwin').animate({opacity:'toggle'}, 350);
							jQuery('#iArt_wunschboxTopBtn', parent.document).fadeIn();
			      		/* -------------------------------------------------------------  */

			      		/* Chatfenster in Position Scrollen und Focus auf Eingabefeld legen  */
			      		/* -------------------------------------------------------------  */
				      		jQuery('#iArt_chatMessageContMainChat').scrollTop(jQuery('#messages').outerHeight());
				      		jQuery('#iArt_chatMessageInput').focus();
			      		/* -------------------------------------------------------------  */

						/* Admin-Panel einbauen  */
						/* -------------------------------------------------------------  */
							jQuery('#reChatUsers').prepend('<div id="iArt_userpanelAdmin"><div class="iArt_userpanelBox"><div class="iArt_userpanelCont"></div><ul><li class="iArt_userPanelTrigger" data-job="PrivChat" data-user="#"><span class="iArt_userPanelArrows">&raquo;</span> Privatchat starten</li><li class="iArt_userPanelTrigger" data-job="KickUser" data-user="#"><span class="iArt_userPanelArrows">&raquo;</span> Benutzer kicken</li><li class="iArt_userPanelTrigger" data-job="BanUser" data-user="#"><span class="iArt_userPanelArrows">&raquo;</span> Benutzer bannen</li><li><a href="https://db-ip.com/#" id="iArt_usersIPlink" target="_blank"><span class="iArt_userPanelArrows">&raquo;</span> IP: <span id="iArt_ipShow">#</span></a></li></ul></div></div>');
							iArt_buildUpWhishAdmin();
						/* -------------------------------------------------------------  */

						/* Wunschlimit und wünsche erstmals abfragen  */
						/* -------------------------------------------------------------  */
							socket.emit('getWunschLimit');
							socket.emit('zeigewuensche');
						/* -------------------------------------------------------------  */

						/* Admin-Session-Check erstmals aktivieren  */
						/* -------------------------------------------------------------  */
							iArt_checkingREAdminSession();
						/* -------------------------------------------------------------  */

						jQuery('#iArt_chatMessageInput').focus();
					});
				/* ============================================================================================  */


		      	/* Login durch Client erfolgreich  */
	      		/* ============================================================================================  */
					socket.on('login', function (data) {
					    connected = true;
						jQuery('#iArt_connectionErrorMessage').hide();
						jQuery('#iArt_userNameBackup').val(data.username);

						/* Erste ausrichtung der höhen von Chatfenster und Userliste vornehmen  */
						/* -------------------------------------------------------------  */
							jQuery('#iArt_chatmessageContainer, #reChatUsers').css('height', (jQuery(window).innerHeight()-70)+'px');
							jQuery('#iArt_userListContainer, #iArt_smileyInnerCont').css('height', ((jQuery(window).innerHeight()-70)-37)+'px');
						/* -------------------------------------------------------------  */

						/* Begrüßung, Login ausblenden einbinden und Chat anzeigen  */
						/* -------------------------------------------------------------  */
							jQuery('#messages').append(jQuery('<div>').addClass('iArtChatMessageItem').addClass('reChatInfo').html('('+data.zeitpunkt+') Willkommen '+data.username+' im Radio-Emergency.de Chat'));
							jQuery('#reChatLoginBlocker').animate({opacity:'toggle'}, 350, function(){
				      			jQuery('#iArt_chatwin').animate({opacity:'toggle'}, 350);
								jQuery('#iArt_wunschboxTopBtn', parent.document).fadeIn();
				      		});
			      		/* -------------------------------------------------------------  */

			      		/* Chatfenster in Position Scrollen und Focus auf Eingabefeld legen  */
			      		/* -------------------------------------------------------------  */
				      		jQuery('#iArt_chatMessageContMainChat').scrollTop(jQuery('#messages').outerHeight());
				      		jQuery('#iArt_chatMessageInput').focus();
			      		/* -------------------------------------------------------------  */

						/* Wunschlimit und wünsche erstmals abfragen  */
						/* -------------------------------------------------------------  */
							socket.emit('getWunschLimit');
							socket.emit('zeigewuensche');
						/* -------------------------------------------------------------  */

						jQuery('#iArt_chatMessageInput').focus();

						/* Session-Prüfung anwerfen  */
						/* -------------------------------------------------------------  */
							iArt_checkUserSession();
						/* -------------------------------------------------------------  */
					});
				/* ============================================================================================  */


				/* Der gewähle Benutzername ist bereits in Verwendung  */
	      		/* ============================================================================================  */
					socket.on('nologin', function (data) {
					    alert('Der Benutzername "'+data.username+'" ist bereits in Verwendung');
					    jQuery('#reUsername').focus();
					});
				/* ============================================================================================  */


				/* Der gewähle Benutzername ist für Admins/Modis gesperrt  */
	      		/* ============================================================================================  */
					socket.on('noAdmin', function (data) {
					    alert('Der Benutzername "'+data.username+'" ist ein geschützter Name des RE-Teams');
					    jQuery('#reUsername').focus();
					});
				/* ============================================================================================  */


				/* Die Admin-Session wird bereits verwendet  */
	      		/* ============================================================================================  */
					socket.on('noAdminLogin', function (data) {
					    jQuery('body').html('<div style="color: #027A82; font-weight:bold; text-align:center; padding-top:40px; font-size: 18px;line-height: 23px;-webkit-font-smoothing: antialiased;">Admin '+data.username+' ist bereits eingelogged! <br />Doppeltes Verbinden ist nicht möglich!</div>');
					});
				/* ============================================================================================  */



	      		/* Neue Nachricht eingeben  */
	      		/* ============================================================================================  */
		      		jQuery('#iArt_chatmessageForm').submit(function(){
		      			if(connected){

		      				/* Farbauswahl und Smileys schließen wenn geöffnet  */
		      				/* -------------------------------------------------------------  */
			      				if(jQuery('#iArt_colorWin').hasClass('active')){iArt_toggleTextFormating();}

								if(jQuery('#iArt_smileyWin').hasClass('active')){
									iArt_toggleSmileyWin();
								}
		      				/* -------------------------------------------------------------  */

		      				/* Nachricht durch Funktion reinigen lassen und Absenden  */
			      			/* -------------------------------------------------------------  */
				      			var neueNachricht = iArt_ChangeMarkup(jQuery('#iArt_chatMessageInput').val(), true);
				        		if(neueNachricht.trim().length > 0){

									if(privateChatting){
										/* Privatnachricht  */
										/* -------------------------------------------------------------  */
											socket.emit('private chat message', neueNachricht, privateChattingWith, jQuery('#iArt_userNameBackup').val());
										/* -------------------------------------------------------------  */
									}else{
										/* Normale Nachricht  */
										/* -------------------------------------------------------------  */
											socket.emit('chat message', neueNachricht, jQuery('#iArt_userNameBackup').val());
										/* -------------------------------------------------------------  */
									}
									jQuery('#iArt_chatMessageInput').val('').focus();
				        		}else{
				        			jQuery('#iArt_chatMessageInput').focus();
				        		}
			        		/* -------------------------------------------------------------  */
		      			}
		      			return false; /* Urspünglichen submit unterdrücken  */
		      		});
	      		/* ============================================================================================  */


	      		/* Neue Nachricht verarbeiten  */
	      		/* ============================================================================================  */
		      		socket.on('chat message', function(msg){
		        		if(connected){
		        			jQuery('#messages').append(jQuery('<div>').addClass('iArtChatMessageItem').html('('+msg.zeitpunkt+') <img src="http://radio-emergency.de/img/user_'+msg.sex+'_'+msg.istEinAdmin+'.png" /> '+msg.username+': <span style="color:'+msg.farbe+'; font-weight:'+msg.weight+'; font-style:'+msg.style+'">'+msg.message+'</span>'));
		        			jQuery('#iArt_chatMessageContMainChat').scrollTop(jQuery('#messages').outerHeight());

							if(privateChatting){
								if(jQuery('#iArt_TabMainChat').hasClass('active')){}else{
									if(jQuery('#iArt_TabMainChat').hasClass('alert')){}else{
										jQuery('#iArt_TabMainChat').addClass('alert');
										iArt_PlayMessageSound();
									}

									var neuermessagerCount = (((jQuery('#iArt_TabMainChat').find('.iArt_messageCount').html()*100)/100)+1);
									jQuery('#iArt_TabMainChat').find('.iArt_messageCount').html(neuermessagerCount);
								}
							}

						}
		      		});
		      	/* ============================================================================================  */


				/* Neue Privat-Nachricht verarbeiten  */
	      		/* ============================================================================================  */
		      		socket.on('privateMessage', function(msg){
		        		if(connected){


							if(jQuery('#iArt_userNameBackup').val() == msg.fuerden){
								/* Ich bin der Empfaenger */
								/* ============================================================================================  */
									var mitdemda = msg.username;

									/* Check ob Tab fuer diesen Chat bereits besteht  */
									/* -------------------------------------------------------------  */
										var neuerstellung = iArt_checkIfTabExist(mitdemda);
										if(neuerstellung){

											/* Tab muss neu erstellt werden  */
											/* -------------------------------------------------------------  */
												iArt_removeActivClassOnTabs();
												jQuery('#iArt_privMessTabPanel').append('<div class="iArt_ChatTab active" data-user="'+mitdemda+'" id="iArt_privChatTab_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')+'" data-target="iArt_privChat_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')+'">'+mitdemda+'<span class="iArt_howManyMessages"> (<span class="iArt_messageCount">0</span>)</span> <div class="iArt_chatTabClose">x</div></div>');

												/* Check ob Chatfenster neu erstellt werden muss und wenn nötig erstellen  */
												/* -------------------------------------------------------------  */
													var neuerprivchat = iArt_checkIfChatWindowExist(mitdemda);
													if(neuerprivchat){
														jQuery('#iArt_chatmessageContainer').append('<div class="iArt_chatWindowContainer" id="iArt_privChat_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')+'"><div class="messages"><div class="iArtChatMessageItem reChatInfo">Neuer Privatchat mit '+mitdemda+'</div></div>');
													}
												/* -------------------------------------------------------------  */

												/* Das Chatfenster in den Vordergrund bringen  */
												/* -------------------------------------------------------------  */
													iArt_changChatWindow('iArt_privChat_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-'), mitdemda);
													iArt_PlayMessageSound();
												/* -------------------------------------------------------------  */

												/* Klick Funktionen der Tabs (neu) setzten  */
												/* -------------------------------------------------------------  */
													iArt_provTabsClickfunctions();
												/* -------------------------------------------------------------  */
											/* -------------------------------------------------------------  */

										}else{

											/* Es gibt bereits einen Tab für diesen Benutzer  */
											/* -------------------------------------------------------------  */
												var chatistaktiv = iArt_checkIfexistinTabisActive(mitdemda);
												if(!chatistaktiv){

													/* Der Tab ist nicht aktiv (Tab markieren und Sound abspielen) */
													/* -------------------------------------------------------------  */
														if(jQuery('#iArt_privChatTab_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).hasClass('alert')){}else{
															iArt_PlayMessageSound();
															jQuery('#iArt_privChatTab_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).addClass('alert');

														}

														var neuermessagerCount = (((jQuery('#iArt_privChatTab_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).find('.iArt_messageCount').html()*100)/100)+1);
														jQuery('#iArt_privChatTab_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).find('.iArt_messageCount').html(neuermessagerCount);
													/* -------------------------------------------------------------  */
												}

											/* -------------------------------------------------------------  */

										}
									/* -------------------------------------------------------------  */


									/* Nachricht in Chatfenster schreiben  */
									/* -------------------------------------------------------------  */
										jQuery('#iArt_privChat_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).find('.messages').append(jQuery('<div>').addClass('iArtChatMessageItem').html('('+msg.zeitpunkt+') <img src="http://radio-emergency.de/img/user_'+msg.sex+'_'+msg.istEinAdmin+'.png" /> '+iArt_ChangeMarkup(msg.username, false)+': <span style="color:'+msg.farbe+'; font-weight:'+msg.weight+'; font-style:'+msg.style+'">'+iArt_ChangeMarkup(msg.message, true)+'</span>'));
										jQuery('#iArt_privChat_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).scrollTop(jQuery('#iArt_privChat_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).find('.messages').outerHeight());
									/* -------------------------------------------------------------  */


									/* Tab-Panel öffnen falls geschlossen  */
									/* -------------------------------------------------------------  */
										iArt_CheckingTabBar();
									/* -------------------------------------------------------------  */

									/* Tabs-Panel auf Aktiven Chat ausrichten  */
									/* -------------------------------------------------------------  */
										iArt_scrollTabPanel();
									/* -------------------------------------------------------------  */

								/* ============================================================================================  */

							}else if(jQuery('#iArt_userNameBackup').val() == msg.username){

								/* Ich bin der Absender  */
								/* ============================================================================================  */
									/* Nachricht in Chatfenster schreiben  */
									/* -------------------------------------------------------------  */
										jQuery('#iArt_privChat_'+msg.fuerden.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).find('.messages').append(jQuery('<div>').addClass('iArtChatMessageItem').html('('+msg.zeitpunkt+') <img src="http://radio-emergency.de/img/user_'+msg.sex+'_'+msg.istEinAdmin+'.png" /> '+iArt_ChangeMarkup(msg.username, false)+': <span style="color:'+msg.farbe+'; font-weight:'+msg.weight+'; font-style:'+msg.style+'">'+iArt_ChangeMarkup(msg.message, true)+'</span>'));
										jQuery('#iArt_privChat_'+msg.fuerden.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).scrollTop(jQuery('#iArt_privChat_'+msg.fuerden.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).find('.messages').outerHeight());
									/* -------------------------------------------------------------  */

								/* ============================================================================================  */
							}


						}
		      		});
		      	/* ============================================================================================  */

				/* Privatnachricht kann nicht übermittelt werden da User nicht connected ist  */
	      		/* ============================================================================================  */
					socket.on('UserNotConnected', function (data) {
						jQuery('#iArt_privChat_'+data.benutzer.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).find('.messages').append(jQuery('<div>').addClass('iArtChatMessageItem').html('('+data.zeitpunkt+') CHATSYSTEM: <span style="color:#f00; font-weight:bold;">--> Nachricht nicht übermittelt da "'+data.benutzer+'" nicht mehr online ist! <--</span><br /> --> '+data.message+' <--'));
						jQuery('#iArt_privChat_'+data.benutzer.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).scrollTop(jQuery('#iArt_privChat_'+data.benutzer.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).find('.messages').outerHeight());
					});
				/* ============================================================================================  */


				/* Allen Teilnehmern neuen Benutzer anzeigen  */
				/* ============================================================================================  */
					socket.on('user joined', function (data) {
						if(connected){
				    		jQuery('#messages').append(jQuery('<div>').addClass('iArtChatMessageItem').addClass('reChatInfo').html('('+data.zeitpunkt+') '+data.username+' hat den Chat betreten'));
				    		jQuery('#iArt_chatMessageContMainChat').scrollTop(jQuery('#messages').outerHeight());
						}
					});
				/* ============================================================================================  */


				/* Allen Teilnehmern anzeigen, dass ein Benutzer den Chat verlässt */
				/* ============================================================================================  */
					socket.on('user left', function (data) {
						if(connected){
							jQuery('#messages').append(jQuery('<div>').addClass('iArtChatMessageItem').addClass('reChatInfo').html('('+data.zeitpunkt+') '+data.username+' hat den Chat verlassen'));
							jQuery('#iArt_chatMessageContMainChat').scrollTop(jQuery('#messages').outerHeight());
						}
					});
				/* ============================================================================================  */

				/* Eingriff bei Session-Timeout  */
				/* ============================================================================================  */
					socket.on('nope', function(){
						connected=false;
						jQuery('#iArt_chatwin').fadeOut();
						jQuery('#reChatLoginBlocker, #iArt_connectionErrorMessage').fadeIn();
						jQuery('#iArt_ChatUsersList, #messages').html('');
						socket.emit('sessionkick', jQuery('#iArt_userNameBackup').val()); /* Wird nicht verarbeitet */
					});

					socket.on('disconnect', function(){
						if(connected){
							connected=false;
							jQuery('#iArt_chatwin').fadeOut();
							jQuery('#reChatLoginBlocker, #iArt_connectionErrorMessage').fadeIn();
							jQuery('#iArt_ChatUsersList, #messages').html('');
							socket.emit('sessionkick', jQuery('#iArt_userNameBackup').val()); /* Wird nicht verarbeitet */
						}
					});
				/* ============================================================================================  */

				/* Kick-Durchführen */
				/* ============================================================================================  */
					socket.on('userkick', function (data) {
						if(connected){
							if(jQuery('#iArt_userNameBackup').val() == data){
								jQuery('body').html('<div style="color: #027A82; font-weight:bold; text-align:center; padding-top:40px; font-size: 18px;line-height: 23px;-webkit-font-smoothing: antialiased;">Du wurdest durch einen Admin vom Server geworfen!</div>');
								connected=false;
								socket.disconnect();
							}
						}
					});
				/* ============================================================================================  */


				/* Anzeige Benutzerliste  */
				/* ============================================================================================  */
					socket.on('show new userlist', function (data) {
						if(connected){
							var Benutzerausgabe="";
							if(isteiner=="1"){

								/* Generierung Userliste für Moderatoren / Admins  */
								/* -------------------------------------------------------------  */

									/* Mit Object.keys() sortierbares Array der ersten Objektkeys Erzeugen und sortieren */
									/* -------------------------------------------------------------  */
										Object.keys(data).sort(function sortfn (a,b) {
										    /* Interne Funktion in sort() um Chrome / Firefox auch richtig sortieren zu lassen  */
										    /* -------------------------------------------------------------  */
											    var upA = a.toUpperCase();
											    var upB = b.toUpperCase();
											    return (upA < upB) ? -1 : (upA > upB) ? 1 : 0;
										    /* -------------------------------------------------------------  */
										}).forEach(function(k){
											/* Userliste generieren (mit dem sortierten Array wird das Objekt jetzt geziehlt angefragt) */
											/* -------------------------------------------------------------  */
										        if(data[k].istAdmin =="1"){
										        	/* User ist ein anderer Moderatoren/Admins  */
										        	/* -------------------------------------------------------------  */
														if(data[k].uname == jQuery('#iArt_userNameBackup').val()){
															Benutzerausgabe+='<div class="iArt_UserListItem"><span class="iArt_userItemImgCont inactive" data-user="'+data[k].uname+'"><img src="http://radio-emergency.de/img/user_'+data[k].sex+'_'+data[k].istAdmin+'.png" /></span><span class="iArt_userListNameCont">'+data[k].uname+'</span><div class="iArt_bothClear"></div></div>';
														}else{
															Benutzerausgabe+='<div class="iArt_UserListItem"><span class="iArt_userItemImgCont" data-user="'+data[k].uname+'"><img src="http://radio-emergency.de/img/user_'+data[k].sex+'_'+data[k].istAdmin+'.png" /></span><span class="iArt_userListNameCont">'+data[k].uname+'</span><div class="iArt_bothClear"></div></div>';
														}
													/* -------------------------------------------------------------  */
												}else{
									        		/* Normaler Usern (Admin-Panel mit generieren)  */
									        		/* -------------------------------------------------------------  */
														Benutzerausgabe+='<div class="iArt_UserListItem"><span class="iArt_userItemImgCont admin" data-user="'+data[k].uname+'" data-ip="'+data[k].ip+'"><img src="http://radio-emergency.de/img/user_'+data[k].sex+'_'+data[k].istAdmin+'.png" /></span><span class="iArt_userListNameCont">'+data[k].uname+'</span><div class="iArt_bothClear"></div></div>';
													/* -------------------------------------------------------------  */
												}
											/* -------------------------------------------------------------  */
									    });
								    /* -------------------------------------------------------------  */

								/* -------------------------------------------------------------  */

							}else{

								/* Generierung Userlist für normale User  */
								/* -------------------------------------------------------------  */

									/* Mit Object.keys() sortierbares Array der ersten Objektkeys Erzeugen und sortieren */
									/* -------------------------------------------------------------  */
										Object.keys(data).sort(function sortfn (a,b) {
										    /* Interne Funktion in sort() um Chrome / Firefox auch richtig sortieren zu lassen  */
										    /* -------------------------------------------------------------  */
											    var upA = a.toUpperCase();
											    var upB = b.toUpperCase();
											    return (upA < upB) ? -1 : (upA > upB) ? 1 : 0;
										    /* -------------------------------------------------------------  */
										}).forEach(function(k){
											/* Userliste generieren (mit dem sortierten Array wird das Objekt jetzt geziehlt angefragt) */
											/* -------------------------------------------------------------  */
												if(data[k].uname == jQuery('#iArt_userNameBackup').val()){
													Benutzerausgabe+='<div class="iArt_UserListItem"><span class="iArt_userItemImgCont inactive" data-user="'+data[k].uname+'"><img src="http://radio-emergency.de/img/user_'+data[k].sex+'_'+data[k].istAdmin+'.png" /></span><span class="iArt_userListNameCont">'+data[k].uname+'</span><div class="iArt_bothClear"></div></div>';
												}else{
													Benutzerausgabe+='<div class="iArt_UserListItem"><span class="iArt_userItemImgCont" data-user="'+data[k].uname+'"><img src="http://radio-emergency.de/img/user_'+data[k].sex+'_'+data[k].istAdmin+'.png" /></span><span class="iArt_userListNameCont">'+data[k].uname+'</span><div class="iArt_bothClear"></div></div>';
												}
											/* -------------------------------------------------------------  */
										});
								/* -------------------------------------------------------------  */
							}

							/* Userliste in Dokument einfügen  */
							/* -------------------------------------------------------------  */
								jQuery('#iArt_ChatUsersList').html(Benutzerausgabe);
							/* -------------------------------------------------------------  */

							/* Click-Functions nach der Generierung setzen  */
							/* -------------------------------------------------------------  */
								iArt_userPanelClickFunctions();
							/* -------------------------------------------------------------  */
						}
					});
				/* ============================================================================================  */




				/* Farbauswahl  */
				/* ============================================================================================  */

					/* Button für Anzeige des Auswahlfensters  */
					/* -------------------------------------------------------------  */
						jQuery("#iArt_chatFunctionColors").click(function() {
							iArt_toggleTextFormating();
						});
					/* -------------------------------------------------------------  */

					/* Knopf Speichern  */
					/* -------------------------------------------------------------  */
						jQuery("#iArt_colorSpeichern").click(function() {

							/* Aktuelle Textformatierung an Server senden  */
							/* -------------------------------------------------------------  */
								socket.emit('usercolor', jQuery('#iArt_userColor').val(), jQuery('#iArt_userFontWeight').val(), jQuery('#iArt_userFontStyle').val());
							/* -------------------------------------------------------------  */

							/* Aktuelle Anzeigen anpassen  */
							/* -------------------------------------------------------------  */
								jQuery('#iArt_aktuelleSchriftfarbe').css('background',jQuery('#iArt_userColor').val());
								jQuery('#iArt_chatMessageInput').css('color', jQuery('#iArt_userColor').val()).css('font-weight', jQuery('#iArt_userFontWeight').val()).css('font-style', jQuery('#iArt_userFontStyle').val()).focus();
							/* -------------------------------------------------------------  */

							/* Textformatierung ausblenden  */
							/* -------------------------------------------------------------  */
								jQuery('#iArt_colorWin').removeClass('active');
								jQuery('#iArt_colorWin').stop(true, false).fadeOut();
							/* -------------------------------------------------------------  */
						});
					/* -------------------------------------------------------------  */

					/* Click auf Farbfelder  */
					/* -------------------------------------------------------------  */
						jQuery('.iArt_colorToPic').each(function(){
							jQuery(this).click(function(){

								/* Active Klasse neu setzen (Haken)  */
								/* -------------------------------------------------------------  */
									jQuery('.iArt_colorToPic').removeClass('active');
									jQuery(this).addClass('active');
								/* -------------------------------------------------------------  */

								/* Gewählte Farbe in input hinterlegen und aktuelle Textformatierung an Server senden  */
								/* -------------------------------------------------------------  */
									jQuery('#iArt_userColor').val(jQuery(this).attr('data-color'));
									socket.emit('usercolor', jQuery('#iArt_userColor').val(), jQuery('#iArt_userFontWeight').val(), jQuery('#iArt_userFontStyle').val());
								/* -------------------------------------------------------------  */

								/* Aktuelle Anzeigen anpassen  */
								/* -------------------------------------------------------------  */
									jQuery('#iArt_aktuelleSchriftfarbe').css('background',jQuery('#iArt_userColor').val());
									jQuery('#iArt_chatMessageInput').css('color', jQuery('#iArt_userColor').val()).css('font-weight', jQuery('#iArt_userFontWeight').val()).css('font-style', jQuery('#iArt_userFontStyle').val()).focus();
								/* -------------------------------------------------------------  */
							});
						});
					/* -------------------------------------------------------------  */

					/* Click auf Buttons Fett und Kursiv  */
					/* -------------------------------------------------------------  */
						jQuery('.iArt_fontStyleBtn').each(function(){
							jQuery(this).click(function(){
								/* Aktiv-Status An/Aus-schalten uns inputs befüllen  */
								/* -------------------------------------------------------------  */
									jQuery(this).toggleClass('active');
									if(jQuery('#iArt_schriftFett').hasClass('active')){jQuery('#iArt_userFontWeight').val('bold'); jQuery('#iArt_userFontSmoothing').val('antialiased');}else{jQuery('#iArt_userFontWeight').val('normal'); jQuery('#iArt_userFontSmoothing').val('auto');}
									if(jQuery('#iArt_schriftKursiv').hasClass('active')){jQuery('#iArt_userFontStyle').val('italic');}else{jQuery('#iArt_userFontStyle').val('normal');}
								/* -------------------------------------------------------------  */

								/* Aktuelle Textformatierung an Server senden  */
								/* -------------------------------------------------------------  */
									socket.emit('usercolor', jQuery('#iArt_userColor').val(), jQuery('#iArt_userFontWeight').val(), jQuery('#iArt_userFontStyle').val());
								/* -------------------------------------------------------------  */

								/* Aktuelle Anzeigen anpassen  */
								/* -------------------------------------------------------------  */
									jQuery('#iArt_chatMessageInput').css('color', jQuery('#iArt_userColor').val()).css('font-weight', jQuery('#iArt_userFontWeight').val()).css('font-style', jQuery('#iArt_userFontStyle').val()).focus();
								/* -------------------------------------------------------------  */
							});
						});
					/* -------------------------------------------------------------  */
				/* ============================================================================================  */

				/* Pfeile für PrivatChat Tabs  */
				/* ============================================================================================  */

					/* Pfeile ein- / ausblenden  */
					/* -------------------------------------------------------------  */
						jQuery('#iArt_privMessTabPanelContainer').scroll(function(){
							iArt_showTabArrows();
						});
					/* -------------------------------------------------------------  */

					/* Mouseover/leave pfeil links  */
					/* -------------------------------------------------------------  */
						jQuery('#iArt_panelLeft').mouseenter(function(){
							privatTabScollTimeout = window.setInterval(iArt_privMessTabsScrollToLeft, 10);
						}).mouseleave(function(){
							window.clearInterval(privatTabScollTimeout);
						});
					/* -------------------------------------------------------------  */

					/* Mouseover/leave pfeil links  */
					/* -------------------------------------------------------------  */
						jQuery('#iArt_panelRight').mouseenter(function(){
							privatTabScollTimeout = window.setInterval(iArt_privMessTabsScrollToRight, 10);
						}).mouseleave(function(){
							window.clearInterval(privatTabScollTimeout);
						});
					/* -------------------------------------------------------------  */


				/* ============================================================================================  */

				/* Button für Chatsounds  */
				/* ============================================================================================  */
					jQuery('#iArt_toggleChatSounds').click(function(){
						if(!soundsmooving){
							if(jQuery(this).hasClass('active')){
								jQuery(this).removeClass('active');
								soundsDisabled=false;
								soundsmooving=true;
								jQuery('.iArt_toggleSoundBubble').html('Benachrichtigungen aktiviert').stop(true, false).animate({opacity:'toggle', right:'22px'}, 300, function(){
									jQuery('.iArt_toggleSoundBubble').animate({right:'22px'}, 1200, function(){
										jQuery('.iArt_toggleSoundBubble').animate({opacity:'toggle', right:'32px'}, 500, function(){
											soundsmooving=false;
										});
									});
								});

							}else{
								jQuery(this).addClass('active');
								soundsDisabled=true;
								soundsmooving=true;
								jQuery('.iArt_toggleSoundBubble').html('Benachrichtigungen deaktiviert').stop(true, false).animate({opacity:'toggle', right:'22px'}, 300, function(){
									jQuery('.iArt_toggleSoundBubble').animate({right:'22px'}, 1200, function(){
										jQuery('.iArt_toggleSoundBubble').animate({opacity:'toggle', right:'32px'}, 500, function(){
											soundsmooving=false;
										});
									});
								});
							}
						}
					});
				/* ============================================================================================  */


				/* Smileys in Fenster generieren  */
				/* ============================================================================================  */
					var smileyinhalt='';
					jQuery.each( re_smileys, function( key, value ) {
						if(value == "Trenner"){
							smileyinhalt+='<span class="iArt_smileyTrennung"></span>';
						}else{
							smileyinhalt+='<span class="iArt_smileyEntry" data-short="'+key+'">'+value+'</span>';
						}
					});
					smileyinhalt+='<div class="iArt_bothClear"></div>';
					jQuery('#iArt_smileyInnerCont').html(smileyinhalt);

					iArt_addSmileyClickfunction();
				/* ============================================================================================  */


				/* SmileyFenster öffnen / schließen  */
				/* ============================================================================================  */
					jQuery('#iArt_chatFunctionSmileys, #iArt_smileyWinCloser').click(function(){
						iArt_toggleSmileyWin();
					});
				/* ============================================================================================  */


				/* Buttons Formular Musikwunsch öffen/schließen  */
				/* ============================================================================================  */
					jQuery('#iArt_wunschboxBTN, #iArt_wunschFormCloser').click(function(){
						iArt_toggleWhishForm();
					});
				/* ============================================================================================  */


				/* Buttons Wunschbox öffnen/schließen  */
				/* ============================================================================================  */
					jQuery('#iArt_wunschAusgabeCloser').click(function(){
						iArt_toggleWhishList();
					});

					jQuery('#iArt_wunschboxTopBtn', parent.document).click(function(){
						if(isteiner=="1"){
							if(wunschzaehler>0){
								if(jQuery('#iArt_WunschboxAusgabeContainer').hasClass('active')){
									jQuery(this).addClass("alerted");
								}else{
									jQuery(this).removeClass("alerted");
								}
							}else{
								jQuery(this).removeClass("alerted");
							}
						}
						iArt_toggleWhishList();
					});
				/* ============================================================================================  */


				/* Formular Musikwunsch absenden  */
				/* ============================================================================================  */
					jQuery('#iArt_musikWunschForm').submit(function(event){
						event.preventDefault();
						if(connected){
							jQuery('#iArt_wunschboxBlocker').stop(true, false).fadeIn();

							if(wunschlimit >= 1){
								if(iArt_CheckWunschForm()){
									wunschzaehler=0;
									jQuery('.iArt_musikwunschItem').each(function(){
										if(jQuery(this).find('.iArt_musikwunschItemUser').html()==jQuery('#iArt_userNameBackup').val())
										wunschzaehler++
									});
									if(wunschzaehler<wunschlimit){
										var bandname= iArt_ChangeMarkup(jQuery('#iArt_whish_Artist').val(), false);
										var songname= iArt_ChangeMarkup(jQuery('#iArt_whish_Titel').val(), false);
										var greeting= iArt_ChangeMarkup(jQuery('#iArt_whishGreet').val(), false);
										socket.emit('neuerWunsch', bandname, songname, greeting);
										jQuery('#iArt_wunschboxBlocker').stop(true, false).fadeOut();
										iArt_toggleWhishForm();
										iArt_bestaetigeWunsch();
										jQuery('#iArt_whish_Artist, #iArt_whish_Titel, #iArt_whishGreet').val('');
									}else{
									 	jQuery('#iArt_wunschboxBlocker').html('Wunschlimit erreicht.<br />Bitte warte bis einer deiner Wünsche abgearbeitet wurde.');
										iArt_fadeOutWunschboxBlocker();
									}

								}
							}else{
								jQuery('#iArt_wunschboxBlocker').html('Die Wunschbox ist zur Zeit geschlossen.');
							}
							return false;
						}
					});
				/* ============================================================================================  */


				/* Wunschlimit übernehmen  */
				/* ============================================================================================  */
					socket.on('Wunschlimit', function (daslimit) {
						if(daslimit<=0){
							jQuery('#iArt_wunschboxBlocker').html('Die Wunschbox ist zur Zeit geschlossen.').fadeIn();
						}else{
							jQuery('#iArt_wunschboxBlocker').html('').fadeOut();
						}
						wunschlimit = daslimit;
						jQuery('#iArt_zeigWunschlimit').html(wunschlimit);
						jQuery('#iArt_wunschlimitImAdmin').text(wunschlimit);
						if(jQuery('#iArt_wunschlimitSetter').hasClass('active')){iArt_toggleWunschLimitAdmin();}
					});
				/* ============================================================================================  */

				/* Wunschliste generieren und ausgeben  */
				/* ============================================================================================  */
					socket.on('Wunschliste', function (dieWunschliste) {
						var dieNeueWunschListe ="";
						wunschzaehler =0;
						for(var key in dieWunschliste) {
							wunschzaehler++;
							if(isteiner=="1"){
								dieNeueWunschListe+='<div data-id="'+dieWunschliste[key].id+'" data-status="'+dieWunschliste[key].wstatus+'" class="iArt_musikwunschItem admin status_'+dieWunschliste[key].wstatus+'">';
							}else{
								dieNeueWunschListe+='<div data-id="'+dieWunschliste[key].id+'" data-status="'+dieWunschliste[key].wstatus+'" class="iArt_musikwunschItem status_'+dieWunschliste[key].wstatus+'">';
							}
								dieNeueWunschListe+='<div class="iArt_musikwunschItemUser">'+dieWunschliste[key].user+'</div>';
								dieNeueWunschListe+='<div class="iArt_musikwunschItemBand">'+dieWunschliste[key].band+'</div>';
								dieNeueWunschListe+='<div class="iArt_musikwunschItemSong">'+dieWunschliste[key].song+'</div>';
								if(isteiner=="1"){dieNeueWunschListe+='<div class="iArt_musikwunschItemGreet">'+dieWunschliste[key].greet+'</div>';}

							dieNeueWunschListe+='</div>';
						}
						dieNeueWunschListe+='<div class="iArt_bothClear"></div>';
						jQuery('#iArt_wunschboxAusgabeInner').html(dieNeueWunschListe);

						if(wunschzaehler>0){jQuery('#iArt_blockOnEmtyBox').hide();}else{jQuery('#iArt_blockOnEmtyBox').show();}

						if(isteiner=="1"){
							jQuery('.iArt_musikwunschItem').each(function(){
								jQuery(this).click(function(){
									var dieWunschID = jQuery(this).attr('data-id');
									var derWunschStatus = jQuery(this).attr('data-status');
									var derWuenscher = jQuery(this).find('.iArt_musikwunschItemUser').text();
									var dieBAnd = jQuery(this).find('.iArt_musikwunschItemBand').text();
									var derSong = jQuery(this).find('.iArt_musikwunschItemSong').text();
									var derGruss = jQuery(this).find('.iArt_musikwunschItemGreet').text();

									jQuery('#iArt_WuenscherInBox').text(derWuenscher);
									jQuery('#iArt_wunschboxBearbID').text(dieWunschID);
									jQuery('#iArt_wunschboxBandArea').find('.iArt_wunschboxBearbValue').text(dieBAnd);
									jQuery('#iArt_wunschboxSongArea').find('.iArt_wunschboxBearbValue').text(derSong);
									jQuery('#iArt_wunschboxGreetArea').find('.iArt_wunschboxBearbValue').text(derGruss);

									iArt_toggleWhishListItem();
								});
							});

							if(wunschzaehler>0){
								if(jQuery('#iArt_WunschboxAusgabeContainer').hasClass('active')){
									jQuery('#iArt_wunschboxTopBtn', parent.document).removeClass("alerted");
								}else{
									jQuery('#iArt_wunschboxTopBtn', parent.document).addClass("alerted");
									jQuery('.iArt_wishesAlert', parent.document).each(function(){
										jQuery(this).html('('+wunschzaehler+')');
									});
								}
							}else{
								jQuery('#iArt_wunschboxTopBtn', parent.document).removeClass("alerted");
							}
						}

					});
				/* ============================================================================================  */


				/* Admin-Panel für Wunschbox generieren */
				/* ============================================================================================  */
					function iArt_buildUpWhishAdmin(){
						var adminbereich="";
						adminbereich+='<div id="iArt_WunschboxLimit">';
							adminbereich+='<div id="iArt_wunschlimitImAdmin">0</div>';
							adminbereich+='<form id="iArt_wunschlimitSetter" action="#nix">';
								adminbereich+='<div id="iArt_wunschlimitRunter"><div class="highlight"></div></div>';
								adminbereich+='<div id="iArt_wunschlimitHoch"><div class="highlight"></div></div>';
								adminbereich+='<input type="submit" id="iArt_wunschlimitSubmit" value="" />';
							adminbereich+="</form>";
						adminbereich+="</div>";
						adminbereich+='<div id="iArt_WunschBearbeitung">';
							adminbereich+='<div id="iArt_wunschboxBearbeitenHead">Musikwunsch von: <span id="iArt_WuenscherInBox">Bla</span><div id="iArt_wunschBearbeitenCloser">x</div></div>';
							adminbereich+='<div id="iArt_wunschboxBandArea">Band:<span class="iArt_wunschboxBearbValue"></span></div>';
							adminbereich+='<div id="iArt_wunschboxSongArea">Song:<span class="iArt_wunschboxBearbValue"></span></div>';
							adminbereich+='<div id="iArt_wunschboxGreetArea">Gru&szlig;:<div id="iArt_wunschboxBearbgreetContainer"><span class="iArt_wunschboxBearbValue"></span></div></div>';
							adminbereich+='<div id="iArt_wunschboxBearbButtonArea">';
								adminbereich+='<div class="iArt_WunschBearbBtn" id="iArt_wunschboxButtonInList">In der Liste</div>';
								adminbereich+='<div class="iArt_WunschBearbBtn" id="iArt_wunschboxButtonNotThere">Hab ich nicht</div>';
								adminbereich+='<div class="iArt_WunschBearbBtn" id="iArt_wunschboxButtonErledigt">Erledigt -></div>';
							adminbereich+="</div>";
							adminbereich+='<div id="iArt_wunschboxBearbID"></div>';
						adminbereich+="</div>";

						adminbereich+='<form action="nix" class="iArt_wunschbearbeiter" id="iArt_wunschstatus_1"><input type="hidden" class="iArt_wunschStatus" value="1" /></form>';
						adminbereich+='<form action="nix" class="iArt_wunschbearbeiter" id="iArt_wunschstatus_2"><input type="hidden" class="iArt_wunschStatus" value="2" /></form>';
						adminbereich+='<form action="nix" class="iArt_wunschbearbeiter" id="iArt_wunschKiller"></form>';
						jQuery('#iArt_wunschboxAusgabeHead').prepend(adminbereich);

						jQuery('#iArt_wunschlimitImAdmin').click(function(){
							iArt_toggleWunschLimitAdmin();
						});

						jQuery('#iArt_wunschlimitRunter').click(function(){
							if((((jQuery('#iArt_wunschlimitImAdmin').text())*100)/100) > 0){
								jQuery('#iArt_wunschlimitImAdmin').text(((((jQuery('#iArt_wunschlimitImAdmin').text())*100)/100)-1));
							}
						});

						jQuery('#iArt_wunschlimitHoch').click(function(){
							if((((jQuery('#iArt_wunschlimitImAdmin').text())*100)/100) < 10){
								jQuery('#iArt_wunschlimitImAdmin').text(((((jQuery('#iArt_wunschlimitImAdmin').text())*100)/100)+1));
							}
						});

						socket.emit('getWunschLimit');


						/* Wunschlimit ändern  */
						/* -------------------------------------------------------------  */
							jQuery('#iArt_wunschlimitSetter').submit(function(event){
								event.preventDefault();
								if(connected){
									var dasneueLimit = (((jQuery('#iArt_wunschlimitImAdmin').text())*100)/100);
									socket.emit('neuesWunschlimit', dasneueLimit);
									return false;
								}
							});
						/* -------------------------------------------------------------  */

						/* Button Wunsch öffnen/schließen (nur Admin)  */
						/* -------------------------------------------------------------  */
							jQuery('#iArt_wunschBearbeitenCloser').click(function(){
								iArt_toggleWhishListItem();
							});
						/* -------------------------------------------------------------  */

						/* Formulare Wunsch beabeiten   */
						/* -------------------------------------------------------------  */
							jQuery('#iArt_wunschstatus_1, #iArt_wunschstatus_2').submit(function(event){
								event.preventDefault();
								var wunschId= jQuery('#iArt_wunschboxBearbID').text();
								var wunschstatus= jQuery(this).find('.iArt_wunschStatus').val();
								socket.emit('statuswechsel', wunschId, wunschstatus);
								iArt_toggleWhishListItem();
								return false;
							});

							jQuery('#iArt_wunschKiller').submit(function(event){
								event.preventDefault();
								var wunschId= jQuery('#iArt_wunschboxBearbID').text();
								socket.emit('wunschFertig', wunschId);
								iArt_toggleWhishListItem();
								return false;
							});
						/* -------------------------------------------------------------  */

						/* Klick-Funktionen der Bearbeitungs-Buttons  */
						/* -------------------------------------------------------------  */
							jQuery('#iArt_wunschboxButtonInList').click(function(){
								jQuery('#iArt_wunschstatus_1').submit();
							});

							jQuery('#iArt_wunschboxButtonNotThere').click(function(){
								jQuery('#iArt_wunschstatus_2').submit();
							});

							jQuery('#iArt_wunschboxButtonErledigt').click(function(){
								jQuery('#iArt_wunschKiller').submit();
							});
						/* -------------------------------------------------------------  */

					}
				/* ============================================================================================  */

				/* Userliste checken  */
				/* ============================================================================================  */
					function iArt_checkUserSession(){
						socket.emit('WerBinIch');
						window.setTimeout(function(){iArt_checkUserSession();}, 6000);
					}

					socket.on('werBinIch', function (derName) {
						jQuery('#iArt_userNameBackup').val(derName);
					});
				/* ============================================================================================  */

			});
      	/* ############################################################################################################ */



/* ############################################################################################################ */
/* ############################################################################################################ */
/* ############################################################################################################ */



      	/* Strings umbauen  */
      	/* ############################################################################################################ */
	      	function iArt_ChangeMarkup(input, withSmile) {

	      		/* Javascripte komplett entfernen  */
	      		/* ============================================================================================  */
	      			str = input.replace(/<script[^>]*>.*?<\/script>/g,'');
	      		/* ============================================================================================  */

	      		/* HTML-Markup entfernen  */
	      		/* ============================================================================================  */
		      		var html_killed = str.replace(/<[^!](?:[^>"']|"[^"]*"|'[^"]*')*>|<!--.*?-->/g,' ')
			           .replace(/ +/g, ' ')
			           .replace(/^\s+/g, '')
			           .replace(/\s+$/g, '');
		        /* ============================================================================================  */

		        /* Smileys einfügen (Nur bei Chatnachrichten)  */
		        /* ============================================================================================  */
			        if(withSmile){
				        jQuery.each( re_smileys, function( key, value ) {
				        	var chucked = html_killed.split(key);
				        	html_killed = chucked.join(value);
						});
			        }
		        /* ============================================================================================  */

				/* Doppelte, führende oder folgende Leerzeichen entfernen und string ausgeben  */
				/* ============================================================================================  */
					html_killed.trim()
			    	return html_killed;
		    	/* ============================================================================================  */
			}
		/* ############################################################################################################ */


		/* URL-Partameter auslesen und als Array zurück werfen  */
		/* ############################################################################################################ */
			function get_url_param( name ){
				name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");

				var regexS = "[\\?&]"+name+"=([^&#]*)";
				var regex = new RegExp( regexS );
				var results = regex.exec( window.location.href );

				if ( results == null )
					return "";
				else
					return results[1];
			}
		/* ############################################################################################################ */


		/* Chatfenster bei Größenveränderungen an Fenstergröße anpassen */
		/* ############################################################################################################ */
			jQuery(window).resize(function() {
				jQuery('#iArt_chatmessageContainer, #reChatUsers').css('height', (jQuery(window).innerHeight()-70)+'px');
				jQuery('#iArt_userListContainer, #iArt_smileyInnerCont').css('height', ((jQuery(window).innerHeight()-70)-37)+'px');
				jQuery('#iArt_chatMessageContMainChat').scrollTop(jQuery('#messages').outerHeight());
			 });
		/* ############################################################################################################ */


		/* Tabs und Chatfenster (Privatchats) */
		/* ############################################################################################################ */

			/* Active-Klasse von allen Tabs entfernen  */
			/* ============================================================================================  */
				function iArt_removeActivClassOnTabs(){
					jQuery('#iArt_privMessTabPanel').find('.iArt_ChatTab').each(function(){
						jQuery(this).removeClass('active');
					});
				}
			/* ============================================================================================  */

			/* Chatfenster wechseln  */
			/* ============================================================================================  */
				function iArt_changChatWindow(dendazeigen, user){
					if(dendazeigen == "iArt_chatMessageContMainChat"){
						privateChatting=false;
						privateChattingWith='';
					}else{
						privateChatting=true;
						privateChattingWith=user;
					}
					jQuery('.iArt_chatWindowContainer').hide();
					jQuery('#'+dendazeigen).show();
				}
			/* ============================================================================================  */


			/* Klick-Funktionen für Tabs und Tab-Closer zuteilen  */
			/* ============================================================================================  */
				function iArt_provTabsClickfunctions(){
					jQuery('.iArt_ChatTab').each(function(){

						/* Klick auf Tab (Chat wechseln)  */
						/* ============================================================================================  */
							jQuery(this).unbind().click(function(){
								if(jQuery(this).hasClass('active')){}else{
									iArt_removeActivClassOnTabs();
									jQuery(this).addClass('active');
									jQuery(this).removeClass('alert');
									jQuery(this).find('.iArt_messageCount').html('0');
									iArt_changChatWindow(jQuery(this).attr('data-target'), jQuery(this).attr('data-user'));
									iArt_scrollTabPanel();
								}
							});
						/* ============================================================================================  */
					});

					/* Klick auf Tab-Schließen-Knopf (Tab löschen und Chat ausblenden)  */
					/* ============================================================================================  */
						jQuery('.iArt_chatTabClose').each(function(){
							jQuery(this).unbind().click(function(){

								if(jQuery(this).parent().hasClass('active')){
									iArt_removeActivClassOnTabs();
									jQuery(this).parent().prev('.iArt_ChatTab').addClass('active');
									iArt_changChatWindow(jQuery(this).parent().prev('.iArt_ChatTab').attr('data-target'), jQuery(this).parent().prev('.iArt_ChatTab').attr('data-user'));
									iArt_scrollTabPanel();
								}

								jQuery(this).parent().remove();
								iArt_scrollTabPanel();
								iArt_CheckingTabBar();
								return false;
							});
						});
					/* ============================================================================================  */
				}
			/* ============================================================================================  */

			/* Tab-Leiste für Privatchat ein- / ausblenden  */
			/* ============================================================================================  */
				function iArt_CheckingTabBar(){
					var wieviele = 0;
					jQuery('.iArt_ChatTab').each(function(){
						wieviele++;
					});

					if(wieviele > 1){
						if(!privateTabPanelOpen){
							privateTabPanelOpen=true;
							jQuery('#iArt_chatMessageContMainChat').animate({top:'30px'}, 150);
							jQuery('#iArt_privMessTabPanelContainer').animate({height:'toggle'}, 150);
						}
					}else{
						if(privateTabPanelOpen){
							privateTabPanelOpen=false;
							jQuery('#iArt_chatMessageContMainChat').animate({top:'0px'}, 150);
							jQuery('#iArt_privMessTabPanelContainer').animate({height:'toggle'}, 150);
						}
					}
				}
			/* ============================================================================================  */

			/* Tabs auf richtige Position scrollen wenn ein neuer auf aktiv gesetzt wird  */
			/* ============================================================================================  */
				function iArt_scrollTabPanel(){
					var positiondesTabs = jQuery('.iArt_ChatTab.active').position();
					var breiteAllertabs = iArtBreiteAllerTabs();
					var breiteBisZumAktivenTab = iArtBreiteBisAktiverTab();

					if(breiteAllertabs > jQuery('#iArt_privMessTabPanelContainer').innerWidth()){
						jQuery('#iArt_privMessTabPanelContainer').scrollLeft((breiteBisZumAktivenTab - jQuery('#iArt_privMessTabPanelContainer').innerWidth()));
					}else{
						jQuery('#iArt_privMessTabPanelContainer').scrollLeft(0);
						jQuery('#iArt_panelLeft, #iArt_panelRight').fadeOut('fast');
					}
				}
			/* ============================================================================================  */


			/* Tabs nach links scrollen  */
			/* ============================================================================================  */
				function iArt_privMessTabsScrollToLeft(){
					var theLeftscroll = jQuery('#iArt_privMessTabPanelContainer').scrollLeft();
					if(theLeftscroll > 0){
						if(theLeftscroll > 2){
							jQuery('#iArt_privMessTabPanelContainer').scrollLeft((theLeftscroll-2));
						}else{
							jQuery('#iArt_privMessTabPanelContainer').scrollLeft(0);
							window.clearInterval(privatTabScollTimeout);
						}
					}else{
						window.clearInterval(privatTabScollTimeout);
					}
				}
			/* ============================================================================================  */

			/* Tabs nach rechts scrollen  */
			/* ============================================================================================  */
				function iArt_privMessTabsScrollToRight(){
					var breiteAllertabs = iArtBreiteAllerTabs();

					if(breiteAllertabs > jQuery('#iArt_privMessTabPanelContainer').innerWidth()){
						var dieDifferenz =(breiteAllertabs - jQuery('#iArt_privMessTabPanelContainer').innerWidth());
						var theLeftscroll = jQuery('#iArt_privMessTabPanelContainer').scrollLeft();
						var nochZuScrollen = (dieDifferenz-theLeftscroll)


						if(nochZuScrollen > 0){
							if(nochZuScrollen > 2){
								jQuery('#iArt_privMessTabPanelContainer').scrollLeft((theLeftscroll+2));
							}else{
								jQuery('#iArt_privMessTabPanelContainer').scrollLeft(dieDifferenz);
							}
						}else{
							jQuery('#iArt_privMessTabPanelContainer').scrollLeft(dieDifferenz);
							window.clearInterval(privatTabScollTimeout);
						}
					}else{
						jQuery('#iArt_privMessTabPanelContainer').scrollLeft(dieDifferenz);
						window.clearInterval(privatTabScollTimeout);
					}
				}
			/* ============================================================================================  */

			/* Pfeile ein/Ausblenden  */
			/* ============================================================================================  */
				function iArt_showTabArrows(){

					/* Pfeil Links  */
					/* -------------------------------------------------------------  */
						if(jQuery('#iArt_privMessTabPanelContainer').scrollLeft() > 0){
							if(jQuery('#iArt_panelLeft').is(':hidden')){
								jQuery('#iArt_panelLeft').stop(true, false).animate({opacity:'toggle'}, 200);
							}
						}else{
							if(jQuery('#iArt_panelLeft').is(':visible')){
								jQuery('#iArt_panelLeft').stop(true, false).animate({opacity:'toggle'}, 200);
							}
						}
					/* -------------------------------------------------------------  */

					/* Pfeil rechts  */
					/* -------------------------------------------------------------  */
						var breiteAllertabs = iArtBreiteAllerTabs();

						if((breiteAllertabs - jQuery('#iArt_privMessTabPanelContainer').scrollLeft()) > jQuery('#iArt_privMessTabPanelContainer').innerWidth()){
							if(jQuery('#iArt_panelRight').is(':hidden')){
								jQuery('#iArt_panelRight').stop(true, false).animate({opacity:'toggle'}, 400);
							}
						}else{
							if(jQuery('#iArt_panelRight').is(':visible')){
								jQuery('#iArt_panelRight').stop(true, false).animate({opacity:'toggle'}, 400);
							}
						}
					/* -------------------------------------------------------------  */

				}
			/* ============================================================================================  */


			/* Ermittlung der Breite der Chattabs  */
			/* ============================================================================================  */

				/* Breite aller Chat-Tabs  */
				/* -------------------------------------------------------------  */
					function iArtBreiteAllerTabs(){
						var breiteDerTabs=0;
						jQuery('.iArt_ChatTab').each(function(){
							breiteDerTabs += (jQuery(this).innerWidth()+1);
						});
						return breiteDerTabs;
					}
				/* -------------------------------------------------------------  */

				/* Breite inkl. aktiver Chat-Tab  */
				/* -------------------------------------------------------------  */
					function iArtBreiteBisAktiverTab(){
						var breiteDerTabs=0;
						var aktivwarnochnicht = 0
						jQuery('.iArt_ChatTab').each(function(){
							if(jQuery(this).hasClass('active')){
								breiteDerTabs += (jQuery(this).innerWidth()+1);
								aktivwarnochnicht = 1;
							}else{
								if(aktivwarnochnicht == 0){
									breiteDerTabs += (jQuery(this).innerWidth()+1);
								}
							}
						});
						return breiteDerTabs;
					}
				/* -------------------------------------------------------------  */
			/* ============================================================================================  */


			/* Ermitteln ob zu erstellender Tab schon existiert  */
			/* ============================================================================================  */
				function iArt_checkIfTabExist(mitwem){
					var dermussnoch = true;
					jQuery('#iArt_privMessTabPanel').find('.iArt_ChatTab').each(function(){
						if(jQuery(this).attr('data-user')== mitwem){
							dermussnoch = false;
						}
					});
					return dermussnoch;
				}
			/* ============================================================================================  */


			/* Ermitteln ob bereits erstellter Tab aktiv ist  */
			/* ============================================================================================  */
				function iArt_checkIfexistinTabisActive(mitwem){
					var derissSchon = false;
					jQuery('#iArt_privMessTabPanel').find('.iArt_ChatTab').each(function(){
						if(jQuery(this).attr('data-user')== mitwem){
							if(jQuery(this).hasClass('active')){
								derissSchon = true;
							}
						}
					});
					return derissSchon;
				}
			/* ============================================================================================  */


			/* Ermitteln ob zu erstellendes Chatfenster bereits existiert  */
			/* ============================================================================================  */
				function iArt_checkIfChatWindowExist(mitdemda){
					var denMussMannNoch = true;
					jQuery('#iArt_chatmessageContainer').find('.iArt_chatWindowContainer').each(function(){
						if(jQuery(this).attr('id')== 'iArt_privChat_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')){
							denMussMannNoch = false;
						}
					});
					return denMussMannNoch;
				}
			/* ============================================================================================  */
		/* ############################################################################################################ */


		/* Klick-Funktions für Trigger in den Panels der Benutzerliste */
		/* ############################################################################################################ */
			function iArt_userPanelClickFunctions(){

				/* Userpanel öffnen/schließen  */
				/* -------------------------------------------------------------  */
					jQuery('.iArt_userItemImgCont').each(function(){
						jQuery(this).click(function(){
							if(jQuery(this).hasClass('inactive')){}else{
								/* Es ist nicht der eigene User  */
								/* -------------------------------------------------------------  */
									if(jQuery(this).hasClass('active')){}else{
										/* Das Panel ist nicht bereits offen  */
										/* -------------------------------------------------------------  */
											jQuery(this).addClass('active');
											var deruserDa = jQuery(this).attr('data-user');

											if(jQuery(this).hasClass('admin')){
												/* Admin-Panel  */
												/* -------------------------------------------------------------  */
													var dieIpDa = jQuery(this).attr('data-ip');
													jQuery('#iArt_usersIPlink').attr('href', 'https://db-ip.com/'+dieIpDa);
													jQuery('#iArt_ipShow').html(dieIpDa);
													jQuery('#iArt_userpanelAdmin').find('.iArt_userpanelBox').find('.iArt_userPanelTrigger').each(function(){
														jQuery(this).attr('data-user', deruserDa);
													});
													jQuery('#iArt_userpanelAdmin').find('.iArt_userpanelBox').stop(true, false).hide().css('top', (jQuery(this).position().top -13)+'px').animate({opacity:'toggle', right:'188px'}, {duration:200});
												/* -------------------------------------------------------------  */
											}else{
												/* Nur Privatchat  */
												/* -------------------------------------------------------------  */
													jQuery('#iArt_userpanel').find('.iArt_userpanelBox').find('.iArt_userPanelTrigger').each(function(){
														jQuery(this).attr('data-user', deruserDa);
													});
													jQuery('#iArt_userpanel').find('.iArt_userpanelBox').stop(true, false).hide().css('top', (jQuery(this).position().top -5)+'px').animate({opacity:'toggle', right:'188px'}, {duration:200});
												/* -------------------------------------------------------------  */
											}

											jQuery('.iArt_userpanelBox').unbind().mouseleave(function(){
												jQuery('.iArt_userItemImgCont').each(function(){
													jQuery(this).removeClass('active');
												});
												jQuery(this).stop(true, false).animate({opacity:'toggle', right:'198px'}, {duration:250});
											});
										/* -------------------------------------------------------------  */
									}
								/* -------------------------------------------------------------  */
							}
						});

						jQuery('#iArt_userListContainerInner').unbind().scroll(function(){
							jQuery('.iArt_userItemImgCont').each(function(){
								jQuery(this).removeClass('active');
							});
							jQuery('#iArt_userpanelAdmin .iArt_userpanelBox, #iArt_userpanel .iArt_userpanelBox').stop(true, false).hide().css('right', '198px');
						});
					});
				/* -------------------------------------------------------------  */


				jQuery('.iArt_userPanelTrigger').each(function(){
					jQuery(this).click(function(){
						jQuery('.iArt_userpanelBox:visible').mouseleave().unbind();

						if(jQuery(this).attr('data-job') == "KickUser"){

							/* User Kicken  */
							/* ===========================================================================================================  */
								var dendakicken =  jQuery(this).attr('data-user');
								var sicher = confirm("Benutzer "+dendakicken+" wirklich kicken?");
								if (sicher == true){socket.emit('KickUser', dendakicken);}
							/* ===========================================================================================================  */

						}else if(jQuery(this).attr('data-job') == "PrivChat"){

							/* Privatchat Beginnen  */
							/* ===========================================================================================================  */
								var mitdemda= jQuery(this).attr('data-user');
								var neuerstellung = iArt_checkIfTabExist(mitdemda);

								if(jQuery('#iArt_WunschboxAusgabeContainer').hasClass('active')){
									iArt_toggleWhishList();
								}

								/* Check ob Tab / Chat bereits besteht */
								/* -------------------------------------------------------------  */

									if(neuerstellung){
										/* Tab muss neu erstellt werden  */
										/* -------------------------------------------------------------  */
											iArt_removeActivClassOnTabs();
											jQuery('#iArt_privMessTabPanel').append('<div class="iArt_ChatTab active" data-user="'+mitdemda+'" id="iArt_privChatTab_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')+'" data-target="iArt_privChat_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')+'">'+mitdemda+'<span class="iArt_howManyMessages"> (<span class="iArt_messageCount">0</span>)</span> <div class="iArt_chatTabClose">x</div></div>');

											/* Check ob Chatfenster neu erstellt werden muss und wenn nötig erstellen  */
											/* -------------------------------------------------------------  */
												var neuerprivchat = iArt_checkIfChatWindowExist(mitdemda);
												if(neuerprivchat){
													jQuery('#iArt_chatmessageContainer').append('<div class="iArt_chatWindowContainer" id="iArt_privChat_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')+'"><div class="messages"><div class="iArtChatMessageItem reChatInfo">Neuer Privatchat mit '+mitdemda+'</div></div>');
												}
											/* -------------------------------------------------------------  */

											/* Das Chatfenster in den Vordergrund bringen  */
											/* -------------------------------------------------------------  */
												iArt_changChatWindow('iArt_privChat_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-'), mitdemda);
											/* -------------------------------------------------------------  */

											/* Klick Funktionen der Tabs (neu) setzten  */
											/* -------------------------------------------------------------  */
												iArt_provTabsClickfunctions();
											/* -------------------------------------------------------------  */
										/* -------------------------------------------------------------  */
									}else{

										/* Es gibt bereits einen Tab für diesen Benutzer  */
										/* -------------------------------------------------------------  */
											var chatistaktiv = iArt_checkIfexistinTabisActive(mitdemda);
											if(chatistaktiv){
												/* Der Tab ist bereits aktiv (klick ignorieren) */
												/* -------------------------------------------------------------  */
													return false;
												/* -------------------------------------------------------------  */
											}else{
												/* Der Tab ist nicht aktiv (Springen zu diesem Chat ) */
												/* -------------------------------------------------------------  */
													iArt_removeActivClassOnTabs();
													jQuery('#iArt_privChatTab_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-')).addClass('active');
													iArt_changChatWindow('iArt_privChat_'+mitdemda.replace(/ /g, '_').replace(/[^a-z0-9A-Z_]/g, '-'), mitdemda);
												/* -------------------------------------------------------------  */
											}

										/* -------------------------------------------------------------  */
									}

								/* -------------------------------------------------------------  */

								jQuery('#iArt_chatMessageInput').focus();


								/* Tab-Panel öffnen falls geschlossen  */
								/* -------------------------------------------------------------  */
									iArt_CheckingTabBar();
								/* -------------------------------------------------------------  */

								/* Tabs-Panel auf Aktiven Chat ausrichten  */
								/* -------------------------------------------------------------  */
									iArt_scrollTabPanel();
								/* -------------------------------------------------------------  */
							/* ===========================================================================================================  */
						}

					});
				});
			}
		/* ############################################################################################################ */


		/* Nachrichten-Ton abspielen */
		/* ############################################################################################################ */
			function iArt_PlayMessageSound(){
				if(!soundsDisabled){
					document.getElementById('messagePiep').load();
					document.getElementById('messagePiep').play();
				}
			}
		/* ############################################################################################################ */


		/* Admin-Session überprüfen inkl. Keep Alive */
		/* ############################################################################################################ */
			function iArt_checkingREAdminSession(){
				jQuery('#iArt_usersessionCheck').attr('src','');
				jQuery('#iArt_usersessionCheck').attr('src','http://radio-emergency.de/includes/checkadmin_json.php');

				jQuery('#iArt_usersessionCheck').unbind().load(function(){
					var istWirklichderAdmin = jQuery('#iArt_usersessionCheck').contents().find('#iArt_sessionUser').html();
					if(istWirklichderAdmin != "null" && istWirklichderAdmin != ""){
						/* Admin-Session Vorhanden -> Admin-Status erneuern  */
						/* -------------------------------------------------------------  */
							jQuery('#iArt_userNameBackup').val(istWirklichderAdmin);
							isteiner=1;
						/* -------------------------------------------------------------  */
					}else{
						/* Keine Admin-Session  */
						/* -------------------------------------------------------------  */
							jQuery('body').html('<div style="color: #027A82; font-weight:bold; text-align:center; padding-top:40px; font-size: 18px;line-height: 23px;-webkit-font-smoothing: antialiased;">Deine Admin-Session wurde beendet!<br />Bittel logge Dich erneut im RE-Admin ein und lade im Anschluss dieses Fenster neu.</div>');
						/* -------------------------------------------------------------  */
					}
				});

				var nextcheck = window.setTimeout(iArt_checkingREAdminSession, 300000);
			}
		/* ############################################################################################################ */

		/* Smiley-Fenster ein/Ausblenden */
		/* ############################################################################################################ */
			function iArt_toggleSmileyWin(){
				if(jQuery('#iArt_smileyWin').hasClass('active')){
					jQuery('#iArt_smileyWin').removeClass('active');
					jQuery('#iArt_smileyWin').stop(true, false).animate({height:'toggle', opacity:'toggle'}, 500, function(){
						jQuery('#iArt_smileyHelpFrame').hide();
						jQuery('#iArt_chatMessageInput').focus();
					});
				}else{
					if(jQuery('#iArt_WunschboxAusgabeContainer').hasClass('active')){iArt_toggleWhishList();}
					if(jQuery('#iArt_colorWin').hasClass('active')){iArt_toggleTextFormating();}
					jQuery('#iArt_smileyWin').addClass('active');
					jQuery('#iArt_smileyHelpFrame').show();
					jQuery('#iArt_smileyWin').stop(true, false).animate({height:'toggle', opacity:'toggle'}, 500);
					jQuery('#iArt_chatMessageInput').focus();
				}
			}
		/* ############################################################################################################ */

		/* Klick auf Smileys */
		/* ############################################################################################################ */
			function iArt_addSmileyClickfunction(){
				jQuery('.iArt_smileyEntry').each(function(){
					jQuery(this).click(function(){
						jQuery('#iArt_chatMessageInput').val(jQuery('#iArt_chatMessageInput').val()+jQuery(this).attr('data-short')).focus();
					});
				});
			}
		/* ############################################################################################################ */

		/* Prüfung des Musikwunsch-Formulars */
		/* ############################################################################################################ */
			function iArt_CheckWunschForm(){

				if(jQuery('#iArt_whish_Artist').val().length <= 1){
					jQuery('#iArt_wunschboxBlocker').html('Bitte Interpreten angeben.');
					Query('#iArt_whish_Artist').focus();
					iArt_fadeOutWunschboxBlocker();
					return false;
				}else if(jQuery('#iArt_whish_Titel').val().length <= 1){
					jQuery('#iArt_wunschboxBlocker').html('Bitte Titel angeben.');
					jQuery('#iArt_whish_Titel').focus();
					iArt_fadeOutWunschboxBlocker();
					return false;
				}else{
					return true;
				}
			}
		/* ############################################################################################################ */

		/* Blocker im Wunsch-Formular ausblenden */
		/* ############################################################################################################ */
			function iArt_fadeOutWunschboxBlocker(){
				window.setTimeout(function(){
					jQuery('#iArt_wunschboxBlocker').fadeOut();
				}, 1500);
			}
		/* ############################################################################################################ */

		/* Wunsch-Formular Ein/Ausblenden */
		/* ############################################################################################################ */
			function iArt_toggleWhishForm(){
				if(jQuery('#iArt_wunschboxContainer').hasClass('active')){
					jQuery('#iArt_wunschboxContainer').removeClass('active').stop(true, false).animate({height:'toggle', opacity:'toggle'}, 300);
					jQuery('#iArt_chatMessageInput').focus();
				}else{
					if(jQuery('#iArt_smileyWin').hasClass('active')){iArt_toggleSmileyWin();}
					if(jQuery('#iArt_colorWin').hasClass('active')){iArt_toggleTextFormating();}
					jQuery('#iArt_wunschboxContainer').addClass('active').stop(true, false).animate({height:'toggle', opacity:'toggle'}, 300, function(){
						jQuery('#iArt_whish_Artist').focus();
					});
				}
			}
		/* ############################################################################################################ */

		/* Wunschbox Ein/Ausblenden */
		/* ############################################################################################################ */
			function iArt_toggleWhishList(){
				if(jQuery('#iArt_WunschboxAusgabeContainer').hasClass('active')){
					jQuery('#iArt_WunschboxAusgabeContainer').removeClass('active').stop(true, false).animate({height:'toggle', opacity:'toggle'}, 300);
					if(jQuery('#iArt_WunschBearbeitung').hasClass('active')){
						iArt_toggleWhishListItem();
					}
				}else{
					if(jQuery('#iArt_smileyWin').hasClass('active')){iArt_toggleSmileyWin();}
					if(jQuery('#iArt_colorWin').hasClass('active')){iArt_toggleTextFormating();}
					if(jQuery('#iArt_wunschlimitSetter').hasClass('active')){iArt_toggleWunschLimitAdmin();}
					jQuery('#iArt_WunschboxAusgabeContainer').addClass('active').stop(true, false).animate({height:'toggle', opacity:'toggle'}, 300);
				}
				jQuery('#iArt_chatMessageInput').focus();
			}
		/* ############################################################################################################ */

		/* Wunsch öffnen/Schließen (Nur Admin) */
		/* ############################################################################################################ */
			function iArt_toggleWhishListItem(){
					if(jQuery('#iArt_WunschBearbeitung').hasClass('active')){
						jQuery('#iArt_WunschBearbeitung').removeClass('active').stop(true, false).animate({height:'toggle', opacity:'toggle'}, 300);
					}else{
						if(jQuery('#iArt_smileyWin').hasClass('active')){iArt_toggleSmileyWin();}
						if(jQuery('#iArt_colorWin').hasClass('active')){iArt_toggleTextFormating();}
						if(jQuery('#iArt_wunschlimitSetter').hasClass('active')){iArt_toggleWunschLimitAdmin();}
						jQuery('#iArt_WunschBearbeitung').addClass('active').stop(true, false).animate({height:'toggle', opacity:'toggle'}, 300);
					}
					jQuery('#iArt_chatMessageInput').focus();
				}
		/* ############################################################################################################ */

		/* Textformatierung Ein/Ausblenden */
		/* ############################################################################################################ */
			function iArt_toggleTextFormating(){
				if(jQuery('#iArt_colorWin').hasClass('active')){
					/* Textformatierung ist offen  */
					/* -------------------------------------------------------------  */
							jQuery('#iArt_colorWin').removeClass('active');
							jQuery('#iArt_colorWin').stop(true, false).fadeOut();
					/* -------------------------------------------------------------  */
				}else{
					/* Textformatierung ist geschlossen  */
					/* -------------------------------------------------------------  */
						jQuery('#iArt_colorWin').addClass('active');
						if(jQuery('#iArt_smileyWin').hasClass('active')){iArt_toggleSmileyWin();}
						if(jQuery('#iArt_WunschboxAusgabeContainer').hasClass('active')){iArt_toggleWhishList();}
						jQuery('#iArt_colorWin').stop(true, false).fadeIn();
					/* -------------------------------------------------------------  */
			   }
			   jQuery('#iArt_chatMessageInput').focus();
			}
		/* ############################################################################################################ */

		/* Admin für Wunschlimit Ein/Ausblenden */
		/* ############################################################################################################ */
			function iArt_toggleWunschLimitAdmin(){
				if(jQuery('#iArt_wunschlimitSetter').hasClass('active')){
					jQuery('#iArt_wunschlimitSetter').removeClass('active').stop(true, false).animate({opacity:'toggle', left:'30px'}, 200);
					jQuery('#iArt_wunschlimitImAdmin').text(wunschlimit);
				}else{
					jQuery('#iArt_wunschlimitSetter').addClass('active').stop(true, false).animate({opacity:'toggle', left:'20px'}, 200);
				}
			}
		/* ############################################################################################################ */

		/* Bestätigung bei abgesendeten Wunsch */
		/* ############################################################################################################ */
			function iArt_bestaetigeWunsch(){
				jQuery('#iArt_wunschBestaetigung').addClass('active').stop(true, false).animate({bottom:'10px'}, 350, function(){
					jQuery('#iArt_wunschBestaetigung').stop(true, false).animate({bottom:'10px'}, 1200, function(){
						jQuery('#iArt_wunschBestaetigung').stop(true, false).animate({bottom:'-70px'}, 350, function(){
							jQuery('#iArt_wunschBestaetigung').removeClass('active')
						});
					})
				})
			}
		/* ############################################################################################################ */

		/* Alle zusatzfenster ausblenden */
		/* ############################################################################################################ */
			function iArt_hideAllWindows(){
				if(jQuery('#iArt_colorWin').hasClass('active')){
					iArt_toggleTextFormating();
				}
				if(jQuery('#iArt_wunschlimitSetter').hasClass('active')){
					iArt_toggleWunschLimitAdmin();
				}
				if(jQuery('#iArt_WunschboxAusgabeContainer').hasClass('active')){
					iArt_toggleWhishList();
				}
				if(jQuery('#iArt_WunschBearbeitung').hasClass('active')){
					iArt_toggleWhishListItem();
				}
				if(jQuery('#iArt_wunschboxContainer').hasClass('active')){
					iArt_toggleWhishForm();
				}
				if(jQuery('#iArt_smileyWin').hasClass('active')){
					jQuery('#iArt_smileyWin').removeClass('active').stop(true, false).hide();;
					jQuery('#iArt_smileyHelpFrame').hide();
				}
			}
		/* ############################################################################################################ */
