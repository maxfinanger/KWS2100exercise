import { useContext, useEffect, useState } from "react";
import { MapContext } from "../map/mapContext";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";

const landLayer = new VectorLayer({
    className: "land",
    source: new VectorSource({
        url: "/land.json",
        format: new GeoJSON(),
    }),
});

export function LandLayerCheckbox() {
    const [checked, setChecked] = useState(false);

    const { setLayers } = useContext(MapContext);

    useEffect(() => {
        if (checked) {
            setLayers((old) => [...old, landLayer]);
        }
        return () => {
            setLayers((old) => old.filter((l) => l !== landLayer));
        };
    }, [checked]);

    return (
        <div>
            <label>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                />
                {checked ? "Hide" : "Show"} land
            </label>
        </div>
    );
}
