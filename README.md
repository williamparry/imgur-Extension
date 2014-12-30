# imgur Extension by Metronomik #

**Licensed under BSD License**

This is the repository for the [imgur Chrome Extension](https://chrome.google.com/webstore/detail/imgur/ehoopddfhgaehhmphfcooacjdpmbjlao).

Any questions flick me an [email](mailto:william@metronomik.com) or [tweet](https://twitter.com/williamparry)

## New features in 2.1.0 ##

### Slideshow ###

* View your images in a slideshow
* View comments inside the slideshow
* Option to view inline images and webm inside comments
* Option to have your images open in a slideshow context instead of a new tab

### Notifications (experimental) ###

Receive desktop notifications. This is still very experimental.

### Changes under the hood ###

* Background page is now non-persistent
    * Using chrome.alarms 
    * Context menu changes
* GifV fix

###

## How to submit a bug ##

* Disable the existing imgur extension while running this one.
* Please include what operating system you're using, what version of Chrome and any console errors from the [Developer Tools](https://developers.google.com/chrome-developer-tools/).
* Some bugs may cascade and break other functionality, so when something is logged as fixed please reload the extension (refresh the chrome://extensions page) before retesting.

## Developers ##

The project is open source, so if you want to fix bugs or implement new features flick me a message and I'll show you the ropes. It's pretty straightforward with abstracted calls such as:

    model.authenticated.fetchUserImages().addEventListener('EVENT_SUCCESS', function (images) { } );

Similarly, if you're an extension developer and would like to hook your extension up with mine for extra imgur awesomeness, let me know and we'll work out the interop.

## Partners ##

Lloyd from [glyphlibrary 4](http://www.glyphlibrary.com/) will be supplying the icons and screens for the extension.
