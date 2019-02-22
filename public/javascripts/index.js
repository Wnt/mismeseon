document.addEventListener('DOMContentLoaded', event => {
    var map = L.map('map');
    var savedLocation = storedLocation;
    var mbIcon = L.icon({
        iconUrl: 'images/mb_logo.svg',
        iconSize: [64, 64],
        iconAnchor: [32, 32]
    });
    var locationMarker, locationCircle, mbMarker;

    var Hydda_Full = L.tileLayer('https://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    Hydda_Full.addTo(map);

    map.setView([60.4465235742797, 22.249444415651517], 16);

    if (savedLocation) {
        drawMbMarker(savedLocation);
    }
    
    document.querySelector('#locate-me').addEventListener("click", e => {
        map.locate({setView: true, maxZoom: 16});

        map.on('locationfound', e => {
            var radius = e.accuracy / 2;
            clearLocationMarker();
            locationMarker = L.marker(e.latlng).addTo(map);
            locationCircle = L.circle(e.latlng, radius).addTo(map);
        });
    });
    
    document.querySelector('#locate-mb').addEventListener("click", e => {
        map.setView(savedLocation, 16);
    });

    map.on('contextmenu', e => {
        drawMbMarker(e.latlng)
        map.setView(e.latlng);
        confirmSave(e.latlng);
        
    });
    function confirmSave(latlng) {
        window.setTimeout(() => {
            var confirmed = window.confirm('Tallenetaanko mesen sijainti?');
            if (confirmed) {
                saveLocation(latlng);
            }
            else {
                drawMbMarker(savedLocation);
            }
        }, 200);
    };
    function saveLocation(latlng) {
        savedLocation = latlng;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.addEventListener("load", function() {
            if (this.status === 200) {
                if (JSON.parse(this.responseText).result === "OK") {
                    window.alert("Paikka tallennettu!");
                }
            }
        });
        xmlhttp.open("POST", "/save");
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.send(JSON.stringify(latlng));
    }
    function clearLocationMarker() {
        if (locationMarker) {
            locationMarker.remove();
        }
        if (locationCircle) {
            locationCircle.remove();
        }
    }
    function drawMbMarker(latlng) {
        if (mbMarker) {
            mbMarker.remove();
        }
        mbMarker = L.marker(latlng, {icon: mbIcon}).addTo(map)
    }
}, false);