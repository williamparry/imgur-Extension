**This is old code**, and it handles a lot of unique UI/API cases.

## Upload testing
---

2 things to bear in mind:

* An authentication token can expire mid-way through an upload queue, which means it has to re-authenticate and resume uploading
* A user could upload from the gallery page and from the background page (e.g. screenshot) at the same time

### Re-authentication during upload

1. Drag and drop 10x images onto gallery page
2. In dev tools run ```model.authenticated.oAuthManager.invalidateToken()```
3. Watch for re-authentication
4. Images resume uploading

### Re-authentication fail during upload

1. Drag and drop 10x images onto gallery page
2. In dev tools run ```model.authenticated.oAuthManager.invalidateRefreshToken()```
3. Watch for re-authentication fail
4. Watch error state

### Queue from background and main uploads

1. Drag and drop 10x images onto gallery page
2. Take screenshot of web page
3. Watch for success of both upload streams

## Authentication testing
---

## Connect

1. Connect to imgur
2. Follow authentication process
3. Main UI refreshes
4. Context menus update

## Disconnect

1. Disconnect from imgur (in Options)
2. Main UI refreshes
3. Context menus update

## Main UI testing
---

* If image item is an album, show cover
* Infinite scroll works
	* Infinite scroll works when switching albums
* Handle gifv
* Handle copy and paste
* Handle file drag and drop

## Context menu testing
---

* Check every option works

## Notifications
---

* Check every type works and links work

## Upgrade testing
---

1. Load previous version
2. Upload images without authentication
3. Load new version
4. Check that images are still present