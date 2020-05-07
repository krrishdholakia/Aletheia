document.getElementById("submit_btn").addEventListener("click", handleSubmit);
function handleSubmit() {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://us-central1-aletheia-3eef8.cloudfunctions.net/addURL", true);
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        console.log("tabs: ", tabs);
        let origin_url = tabs[0].url;
        console.log("url: ", origin_url);
        xhttp.setRequestHeader("original_url", origin_url);
        
        xhttp.setRequestHeader("linked_url", document.getElementById("linked_url").value);

        let sel_index = document.getElementsByClassName("article-type-component")[0]["selectedIndex"];
        let sel_option = document.getElementsByClassName("article-type-component")[0]["options"][sel_index].text;
        xhttp.setRequestHeader("link_type", sel_option);
        
        xhttp.onreadystatechange = function() {
        document.getElementById("title-text").innerText = "Done!"
        };
        xhttp.send();
    });
}
