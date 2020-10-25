function setupContainerBehavior(newEntry, tabId, highlight){
	let deleteBtn = newEntry.querySelector("img.delete-highlight" );
	deleteBtn.onclick = () => {
		removeHighlight(highlight);
		updateContent(tabId, null, null);
	}
	let goToLinkBtn =newEntry.querySelector("img.gotolink" ); 
	goToLinkBtn.onclick = () => {
		browser.tabs.update(tabId, {url: highlight.url});
		updateContent(tabId, null, null);
	}

	let options = newEntry.querySelector(".entry-options");
	newEntry.onmouseover = () => {
		options.style.display="block";
	};
	newEntry.onmouseout = () => {
		options.style.display="none";
	};

	let noteContent = newEntry.querySelector(".entry-note-container");
	noteContent.onclick = ()=> {
		if(noteContent.firstChild.localName != 'p')
			noteContent.innerHTML = '<p class="entry-note"> ' + highlight.note+ '</p>';
		else
			noteContent.innerHTML = "<img src='../icons/ellipses.svg' title='show note'>";

	};
}
function buildHLDisplayElement(highlight, tabId){

	let newEntry = document.createElement("div");
	newEntry.className = "entry";

	newEntry.innerHTML = `
		 <div class="entry-color" data-uid="${highlight.uid}" style="background-color: ${highlight.color};"></div>
                                <div class="entry-content"><p>${highlight.text} </p>
					<div class="entry-note-container" style="display: ${highlight.note != ""?"block":"none"}">		
						<img src='../icons/ellipses.svg' title='showNote'>
					</div>
					<div class="entry-options">
						<img class="delete-highlight" src="../icons/delete.svg" title="delete highlight">
						<img class="gotolink" src="../icons/external-link.svg" title="go to source">

					</div>
				</div>
                                
		</div>
	`;

	setupContainerBehavior(newEntry, tabId, highlight);
	
	return newEntry;
	
}
function updateContent(tabId, changeInfo, tab){
	if(changeInfo && changeInfo.status != "complete")
		return;
	browser.runtime.sendMessage({request: "viewer-getHighlights"}).then(response => {
		let hlList = document.getElementById("entries-container");
		while(hlList.firstChild){
			hlList.removeChild(hlList.firstChild);
		}
		console.log(response);
		for(let hl of response.highlights){
			

			hlList.appendChild(buildHLDisplayElement(hl, tabId));
		}


	}).catch(e => console.log(e));
}

browser.tabs.onActivated.addListener(updateContent);
browser.tabs.onUpdated.addListener(updateContent);

browser.runtime.onMessage.addListener(function(request, sender){
	if(request.request == "updateViewerContent")
		updateContent(null, null, null);

});
