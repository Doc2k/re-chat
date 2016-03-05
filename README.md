# RE-Chat v.1.0 

Dieser Chat wurde für [www.radio-emergency.de](http://www.radio-emergency.de) von mir zusammengeschraubt.

##Allgemeine Funktionen:
  - Name und Geschlecht für Chatnutzer
  - Smiley-Support
  - individuelle Textfarben sowie Standard-Formatierunge (Fett / Kursiv) für Chatnachrichten.
  - Privatchats in Tabs
  - Wunschbox für Musikwünsche (wird von Administratoren / Moderatoren abgearbeitet)
  - Administratoren-Login über bestehende php-session der Haupt-Seite (Chat ist in iframe eingebunden)
  - Benachrichtigungstöne an- / abschalten
  
-------------------------------

##Funktionen für Admins:
  - Ein / Ausschalter der Wunschbox
  - Verändern des Wunschlimits
  - Abarbeiten von Wünschen in der Box
  - Kicken von Usern
  - Ermitteln von IP-Adressen der User

-------------------------------


##Geplante Funktionen:
  - [ ] Unterstützung BB-Code für Bilder ([img]...[/img])
  - [ ] Unterstützung BB-Code für Links ([link]...[/link])
  - [ ] Responsive-Template um mobile-devices zu unterstützen

-------------------------------


##Bekannte Probleme
  - [ ] Verbindungsabbrüche bei Mobile Devices
  - [ ] Bei Verbindungsabbrüchen kann ein Username in der Liste stecken bleiben und verschwindet dort bis zum Neustart der Anwendung nicht und Blockiert diesen somit für neue Logins.

-------------------------------
 
 

Der Chat verzichtet Absichlich auf jegliches Logging der Useraktivität oder der Nachrichten.
Nichts wird gespeichert!

-------------------------------

Basiert im Grundaufbau auf dem [Getting Started](http://socket.io/get-started/chat/) guide 
der Socket.IO Website. (Einfch für die Grundlagen mal reinsehen ;) 

