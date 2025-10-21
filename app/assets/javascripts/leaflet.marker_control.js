//= require leaflet.add_marker

L.OSM.MarkersControl = L.Control.extend({
    options: {
        position: "topright"
    },

    onAdd: function(map){
        const div = L.DomUtil.create("div", "leaflet-control")
        const saveBut = L.DomUtil.create("a", "control-button", div)
        const showWrap = L.DomUtil.create("div", "leaflet-control", div)
        const showBut = L.DomUtil.create("a", "control-button", showWrap)
        const delWrap = L.DomUtil.create("div", "leaflet-control", div)
        const delBut = L.DomUtil.create("a", "control-button", delWrap)

        saveBut.href = "#"
        saveBut.title = "Save marker"
        saveBut.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-floppy-fill" viewBox="0 0 16 16">
                                <path d="M0 1.5A1.5 1.5 0 0 1 1.5 0H3v5.5A1.5 1.5 0 0 0 4.5 7h7A1.5 1.5 0 0 0 13 5.5V0h.086a1.5 1.5 0 0 1 1.06.44l1.415 1.414A1.5 1.5 0 0 1 16 2.914V14.5a1.5 1.5 0 0 1-1.5 1.5H14v-5.5A1.5 1.5 0 0 0 12.5 9h-9A1.5 1.5 0 0 0 2 10.5V16h-.5A1.5 1.5 0 0 1 0 14.5z"/>
                                <path d="M3 16h10v-5.5a.5.5 0 0 0-.5-.5h-9a.5.5 0 0 0-.5.5zm9-16H4v5.5a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 .5-.5zM9 1h2v4H9z"/>
                            </svg>`

        showBut.href = "#"
        showBut.title = "Show saved markers"
        showBut.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-map-fill" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.598-.49L10.5.99 5.598.01a.5.5 0 0 0-.196 0l-5 1A.5.5 0 0 0 0 1.5v14a.5.5 0 0 0 .598.49l4.902-.98 4.902.98a.5.5 0 0 0 .196 0l5-1A.5.5 0 0 0 16 14.5zM5 14.09V1.11l.5-.1.5.1v12.98l-.402-.08a.5.5 0 0 0-.196 0zm5 .8V1.91l.402.08a.5.5 0 0 0 .196 0L11 1.91v12.98l-.5.1z"/>
                            </svg>`

        delBut.href = "#"
        delBut.title = "Delete a marker"
        delBut.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-trash-fill" viewBox="0 0 16 16">
                                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                            </svg>`

        let showing = false
        let deleting = false
        let allMarkerArr = []
        let name

        L.DomEvent.on(saveBut, "click", L.DomEvent.stopPropagation).on(saveBut, "click", L.DomEvent.preventDefault).on(saveBut, "click", ()=>{
            const marker = L.OSM._marker && L.OSM._marker()
            
            if(marker){
                name = prompt("Enter marker's name: ")
                let markers = JSON.parse(localStorage.getItem("markers") || "[]")

                markers.push({
                    lat: marker.getLatLng().lat,
                    lng: marker.getLatLng().lng,
                    name: name || "Marked location"
                })
                localStorage.setItem("markers", JSON.stringify(markers))
                marker.remove()
            }
            else{
                alert("Put a marker first!")
            }
        })

        L.DomEvent.on(showBut, "click", L.DomEvent.stopPropagation).on(showBut, "click", L.DomEvent.preventDefault).on(showBut, "click", ()=>{
            showing = !showing

            if(showing){
                showWrap.classList.add("active")

                const markers = JSON.parse(localStorage.getItem("markers") || "[]")

                for(let i = 0; i < markers.length; i++){
                    const marker = L.marker([markers[i].lat, markers[i].lng], { icon: OSM.getMarker({}) }).addTo(map)
                    marker.bindPopup(markers[i].name, { autoClose: false }).openPopup()
                    allMarkerArr.push(marker)
                }
            }
            else{
                showWrap.classList.remove("active")
                for(let i = 0; i < allMarkerArr.length; i++){
                    allMarkerArr[i].remove()
                }
                allMarkerArr = []
            }
        })

        L.DomEvent.on(delBut, "click", L.DomEvent.stopPropagation).on(delBut, "click", L.DomEvent.preventDefault).on(delBut, "click", ()=>{
            let markers = JSON.parse(localStorage.getItem("markers") || "[]")
            
            deleting = !deleting
            
            if(deleting && showing){
                delWrap.classList.add("active")
                for(let i = 0; i < allMarkerArr.length; i++){
                    const marker = allMarkerArr[i]
                    const latlng = marker.getLatLng()

                    marker.on("click", function onDelete(){
                        marker.remove()
                        for(j = 0; j < markers.length; j++){
                            if(latlng.lat === markers[j].lat && latlng.lng === markers[j].lng){
                                markers.splice(j, 1)
                                break
                            }
                        }
                        localStorage.setItem("markers", JSON.stringify(markers))
                        allMarkerArr.splice(i, 1)

                        marker.off("click", onDelete)
                    })
                }
            }
            else{
                delWrap.classList.remove("active")
                for (let i = 0; i < allMarkerArr.length; i++) {
                    allMarkerArr[i].off("click")
                }
            }
        })

        return div
    }
})

L.OSM.markerControls = function(options){
    return new L.OSM.MarkersControl(options)
}