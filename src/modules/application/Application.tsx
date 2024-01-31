import React, { MutableRefObject, useEffect, useRef, useState } from "react";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useGeographic } from "ol/proj";
import "./Application.css";
import "ol/ol.css";
import { KommuneLayerCheckbox } from "../kommune/KommuneLayerCheckBox";
import { Layer } from "ol/layer";
import { FylkeLayerCheckbox } from "../fylke/fylkeLayerCheckbox";

useGeographic();

const map = new Map({
    view: new View({ center: [10.5, 59.9], zoom: 8 }),
});

export function Application() {
    function handleFocusUser(e: React.MouseEvent) {
        e.preventDefault();
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            map.getView().animate({
                center: [longitude, latitude],
                zoom: 18,
            });
        });
    }

    const [layers, setLayers] = useState<Layer[]>([
        new TileLayer({ source: new OSM() }),
    ]);

    const mapRef = useRef() as MutableRefObject<HTMLDivElement>;
    useEffect(() => map.setTarget(mapRef.current), []);
    useEffect(() => map.setLayers(layers), [layers]);
    return (
        <>
            <header>
                <h1>Kart Over Norges Kommuner</h1>
            </header>
            <nav>
                <button
                    type="button"
                    className="btn btn-light btn-sm"
                    onClick={handleFocusUser}
                >
                    Focus on me
                </button>
                <KommuneLayerCheckbox map={map} setLayers={setLayers} />
                <FylkeLayerCheckbox map={map} setLayers={setLayers} />
            </nav>
            <div ref={mapRef}></div>
        </>
    );
}
