const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const admin = require('firebase-admin');
const stringHash = require("string-hash");
// const metascraper = require('metascraper');
// const got = require('got');
global.XMLHttpRequest = require("xhr2");
admin.initializeApp(functions.config().firebase);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.getURLS = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== 'GET') {
            return response.status(500).json({
                message: request
            })
        }
        let original_url = encodeURI(request.headers.original_url);
        
        console.log("stringHash(original_url): ", stringHash(original_url));
        admin.database().ref().child(`/links/${stringHash(original_url)}`).once('value').then((snapshot) => {
            console.log("inside this function! ");
            console.log("snapshot: ", snapshot.val());
            let children = snapshot.toJSON()
            let summaries = []
            Object.values(children).forEach((link) => {
                if (link["summary"] !== undefined) {
                    let responseObj = {}
                    responseObj["summary"] = link["summary"]
                    responseObj["linked_url"] = link["linked_url"]
                    summaries.push(responseObj)
                }
            })
            response.status(200).json({
                message: summaries
            }) 
            return snapshot; 
        })
        .catch((err) => {
            console.log("err: ", err);
        });
        return 0; 
    })
})

exports.apiCaller = functions.database.ref('/links/{url}')
    .onUpdate((change) => {
        const after = change.after.val()  // DataSnapshot after the change
        Object.keys(after).forEach((new_link_uid) => {
            if (after[new_link_uid]["summary"] === undefined) {
                let sendObj = {}
                let url = "url"
                sendObj[url] = "" + after[new_link_uid]["linked_url"]
                sendObj = JSON.stringify(sendObj);
                (async () => {
                    var xhr = new XMLHttpRequest();
                    xhr.open("POST", 'http://danielgrimshaw.me:8000/summarize/1', true);
                    //Send the proper header information along with the request
                    xhr.setRequestHeader("Content-Type", "application/raw");
                    xhr.onreadystatechange = function() { // Call a function when the state changes.
                        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                            // Request finished. Do processing here.
                            let responseText = JSON.parse(xhr.responseText)
                            console.log("sendObj: ", sendObj);
                            console.log("it's DONE2!!: ", responseText[0]["sentence"]);
                            admin.database().ref(`${change.after._path}/${new_link_uid}/summary`).set(responseText[0]["sentence"])
                        }
                    }
                    xhr.send(`${sendObj}`);
                
            })()
        }
        })

        // let sendObj = {}
        // let url = "url"
        // sendObj[url] = "https://www.economist.com/finance-and-economics/2020/01/15/blackrock-says-it-wants-to-do-more-for-the-climate"
        // sendObj = JSON.stringify(sendObj);
        // (async () => {
        //     var xhr = new XMLHttpRequest();
        //     xhr.open("POST", 'http://danielgrimshaw.me:8000/summarize/1', true);
        //     //Send the proper header information along with the request
        //     xhr.setRequestHeader("Content-Type", "application/raw");
        //     xhr.onreadystatechange = function() { // Call a function when the state changes.
        //         if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        //             // Request finished. Do processing here.
        //             let responseText = JSON.parse(xhr.responseText)
        //             console.log("it's DONE!!: ", responseText);
        //             console.log("it's DONE2!!: ", responseText[0]["sentence"]);

        //         }
        //     }
        //     xhr.send(`${sendObj}`);
        // })()
        return 0; 
    })

exports.summarizer = functions.database.ref('/links/{url}')
    .onUpdate((change) => {          
        const targetUrl = 'https://www.economist.com/finance-and-economics/2020/01/15/blackrock-says-it-wants-to-do-more-for-the-climate';
        console.log("targetURL: ", targetUrl);
        (async () => {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", 'http://danielgrimshaw.me:8000/summarize/1', true);
            //Send the proper header information along with the request
            xhr.setRequestHeader("Content-Type", "application/raw");
            xhr.onreadystatechange = function() { // Call a function when the state changes.
                if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
                    // Request finished. Do processing here.
                    console.log("this: ", this);
                }
            }
            xhr.send(`url=${targetUrl}`);
        console.log(metadata)
        })()
        return 0; 
    })

exports.maintainDb = functions.database.ref('/links/{url}')
    .onUpdate((change) => {
        const after = change.after.val()  // DataSnapshot after the change
        let links = new Set();
        Object.keys(after).forEach((new_link_uid) => {
            if (links.has(after[new_link_uid].linked_url)) {
                admin.database().ref(`${change.after._path}/${new_link_uid}`).remove()
            } else {
                links.add(after[new_link_uid].linked_url);
            }
        })
        return 0; 
    })

exports.addURL = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        if (request.method !== 'POST') {
            return response.status(500).json({
                message: request
            })
        }
        let original_url = encodeURI(request.headers.original_url);
        let linked_url = encodeURI(request.headers.linked_url); 
        let link_type = request.headers.link_type;
        response.status(200).json({
            message: 'It worked!'
        }) 
        admin.database().ref().child(`/links/${stringHash(original_url)}`).push({
            original_url: original_url,
            linked_url: linked_url,
            link_type: link_type
        }); 
        admin.database().ref().child(`/links/${stringHash(linked_url)}`).push({
            original_url: linked_url,
            linked_url: original_url,
            link_type: link_type
        });        
        return 0; 
    })
})