L.OSM.SavedMarkers = L.Control.extend({
    options: {
        position: "topright"
    },

    onAdd: function(map){
        this._map = map
        const container = L.DomUtil.create("div", "leaflet-control")
        this._container = container

        this._csrf = document.querySelector('meta[name="csrf-token"]')?.content
        this._logged = document.querySelector('meta[name="user-signed-in"]')?.content === "true"

        this._active = false
        this._markerArr = []

        this._createButton("Show saved markers")
        this._addDomEvents()

        return container
    },

    _createButton: function(title){
        const link = L.DomUtil.create("a", "control-button", this._container)
        link.href = "#"
        link.title = title
        link.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" class="bi bi-map-fill" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.598-.49L10.5.99 5.598.01a.5.5 0 0 0-.196 0l-5 1A.5.5 0 0 0 0 1.5v14a.5.5 0 0 0 .598.49l4.902-.98 4.902.98a.5.5 0 0 0 .196 0l5-1A.5.5 0 0 0 16 14.5zM5 14.09V1.11l.5-.1.5.1v12.98l-.402-.08a.5.5 0 0 0-.196 0zm5 .8V1.91l.402.08a.5.5 0 0 0 .196 0L11 1.91v12.98l-.5.1z"/>
                        </svg>`

        this._link = link
    },

    activate: async function(){
        if(this._active) return

        this._active = true
        this._container.classList.add("active")
        await this._addMarkers()
    },

    deactivate: function(){
        if(!this._active) return

        this._active = false
        this._container.classList.remove("active")
        this._removeMarkers()
    },

    toggle(){
        if(this._active){
            this.deactivate()
        }
        else{
            this.activate()
        }
    },

    _addDomEvents: function(){
        L.DomEvent.on(this._link, "click", (e)=>{
            L.DomEvent.stop(e)
            this.toggle()
        })
    },

    _addMarkers: async function(){
        let markers = []

        if(this._logged){
            const res = await fetch("/markers")
            markers = await res.json()
        }
        else{
            markers = JSON.parse(localStorage.getItem("markers") || "[]")
        }

        for(let i = 0; i < markers.length; i++){
            const marker = L.marker([markers[i].lat, markers[i].lng], { icon: OSM.getMarker({}) }).addTo(this._map)
            marker.bindPopup(markers[i].name, { autoClose: false, closeOnClick: false }).openPopup()
            marker._id = markers[i].id || Date.now() + i
            this._markerArr.push(marker)
        }
    },

    _removeMarkers: function(){
        for(let i = 0; i < this._markerArr.length; i++){
            this._markerArr[i].remove()
        }
        this._markerArr = []
    }
})

L.OSM.savedMarkers = function(options){
    return new L.OSM.SavedMarkers(options)
}