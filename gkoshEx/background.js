"use strict";

firebase.initializeApp({
    apiKey: "AIzaSyDD4waRhXJuvqpvkigCb04m21411rGlMb0",
    authDomain: "gkosh-5a6ec.firebaseapp.com",
    databaseURL: "https://gkosh-5a6ec.firebaseio.com",
    projectId: "gkosh-5a6ec",
    storageBucket: "gkosh-5a6ec.appspot.com",
    messagingSenderId: "924930626483",
    appId: "1:924930626483:web:579d191a83f71f5cecf1c6"
  });
  
  var db = firebase.firestore();


    function addHighlights(data){
        db.collection("highlights").doc("all").set(data)
        .then(function(docRef) {
            console.log("Document written with ID: ", docRef.id);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }

// Add option when right-clicking
chrome.contextMenus.create({ title: "Highlight", onclick: highlightTextFromContext, contexts: ["selection"] });
chrome.contextMenus.create({ title: "Toggle Cursor", onclick: toggleHighlighterCursorFromContext });
chrome.contextMenus.create({ title: "Highlighter color", id: "highlight-colors" });
chrome.contextMenus.create({ title: "Yellow", id: "yellow", parentId: "highlight-colors", type:"radio", onclick: changeColorFromContext });
chrome.contextMenus.create({ title: "Cyan", id: "cyan", parentId: "highlight-colors", type:"radio", onclick: changeColorFromContext });
chrome.contextMenus.create({ title: "Lime", id: "lime", parentId: "highlight-colors", type:"radio", onclick: changeColorFromContext });
chrome.contextMenus.create({ title: "Magenta", id: "magenta", parentId: "highlight-colors", type:"radio", onclick: changeColorFromContext });

// Get the initial color value
chrome.storage.sync.get('color', (values) => {
    var color = values.color ? values.color : "yellow";
    chrome.contextMenus.update(color, { checked: true });
});

// Add Keyboard shortcut
chrome.commands.onCommand.addListener(function(command) {
    if (command === "execute-highlight") {
        //trackEvent('highlight-source', 'keyboard-shortcut');
        highlightText();
    }
});

// Listen to messages from content scripts
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action && request.action == 'highlight') {
        //trackEvent('highlight-source', 'highlighter-cursor');
        highlightText();
    } else if (request.action && request.action == 'track-event') {
        if (request.trackCategory && request.trackAction) {
            //trackEvent(request.trackCategory, request.trackAction)
        }
    }
    addHighlights(request.data);
    console.log(request.data);
});

function highlightTextFromContext() {
    //trackEvent('highlight-source', 'context-menu');
    highlightText();
}

function highlightText() {
    //trackEvent('highlight-action', 'highlight');
    chrome.tabs.executeScript({file: 'contentScripts/highlight.js'});
}

function toggleHighlighterCursorFromContext() {
    //trackEvent('toggle-cursor-source', 'context-menu');
    toggleHighlighterCursor();
}

function toggleHighlighterCursor() {
   // trackEvent('highlight-action', 'toggle-cursor');
    chrome.tabs.executeScript({file: 'contentScripts/toggleHighlighterCursor.js'});
}

function removeHighlights() {
    //trackEvent('highlight-action', 'clear-all');
    chrome.tabs.executeScript({file: 'contentScripts/removeHighlights.js'});
}

function showHighlight(highlightId) {
    //trackEvent('highlight-action', 'show-highlight');

    chrome.tabs.executeScript({
        code: `var highlightId = ${highlightId};`
    }, function() {
        chrome.tabs.executeScript({file: 'contentScripts/showHighlight.js'});
    });
}

function changeColorFromContext(info) {
    //trackEvent('color-change-source', 'context-menu');
    changeColor(info.menuItemId);
}

function changeColor(color) {
    //trackEvent('color-changed-to', color);
    chrome.storage.sync.set({ color: color });

    // Also update the context menu
    chrome.contextMenus.update(color, { checked: true });
}

function trackEvent(category, action) {
    _gaq.push(['_trackEvent', category, action]);
}




