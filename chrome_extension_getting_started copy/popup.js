let changeColor = document.getElementById('changeColor');

// chrome.storage.sync.get('color', function(data) {
//   changeColor.style.backgroundColor = data.color;
//   changeColor.setAttribute('value', data.color);
// });
window.addEventListener("load", windowMount);

function windowMount() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://us-central1-aletheia-3eef8.cloudfunctions.net/getURLS", true);
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        console.log("tabs: ", tabs);
        let origin_url = tabs[0].url;
        console.log("url: ", origin_url);
        xhttp.setRequestHeader("original_url", origin_url);
        xhttp.onreadystatechange = function() {
        let response = JSON.parse(xhttp.responseText)["message"];
        console.log("response: ", response);
        if (response.length > 0) {
            document.getElementById("news-list").innerHTML = null; 
            for (var count = 0; count < response.length; count++) {
                // create a new div element 
                var newDiv = document.createElement("li"); 
                // and give it some content 
                var newContent = document.createTextNode(response[count]["summary"]); 
                newDiv.setAttribute("id", "news-article")
                var newLink = document.createElement("a");
                newLink.appendChild(newContent);
                let url = decodeURI(response[count]["linked_url"])
                newLink.setAttribute("href", `${url}`)
                newLink.setAttribute("target", "_blank")
                // add the text node to the newly created div
                newDiv.appendChild(newLink);  
    
                // add the newly created element and its content into the DOM 
                document.getElementById("news-list").appendChild(newDiv); 
            }
        }
       
        // document.getElementById("content-component").innerText = response;
        };
        xhttp.send();
    });
}