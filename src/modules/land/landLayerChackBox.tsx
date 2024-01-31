import {
    Dispatch,
    MutableRefObject,
    SetStateAction,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Layer } from "ol/layer";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Feature, Map, MapBrowserEvent, Overlay } from "ol";
import { Polygon } from "ol/geom";

type LandProperties = {
    ADMIN: string;
};

type LandFeature = Feature<Polygon> & {
    getProperties(): LandProperties;
};

const landSource = new VectorSource<LandFeature>({
    url: "/KWS2100exercise/land.json",
    format: new GeoJSON(),
});
const landLayer = new VectorLayer({
    source: landSource,
});

export function LandLayerCheckbox({
    map,
    setLayers,
}: {
    map: Map;
    setLayers: Dispatch<SetStateAction<Layer[]>>;
}) {
    const [checked, setChecked] = useState(false);
    const overlay = useMemo(() => new Overlay({}), []);
    const overlayRef = useRef() as MutableRefObject<HTMLDivElement>;
    useEffect(() => {
        overlay.setElement(overlayRef.current);
        map.addOverlay(overlay);
        return () => {
            map.removeOverlay(overlay);
        };
    }, []);
    const [selectedLand, setSelectedLand] = useState<LandFeature | undefined>();
    function handleClick(e: MapBrowserEvent<MouseEvent>) {
        const clickedLand = landSource.getFeaturesAtCoordinate(
            e.coordinate
        ) as LandFeature[];
        if (clickedLand.length === 1) {
            setSelectedLand(clickedLand[0]);
            overlay.setPosition(e.coordinate);
        } else {
            setSelectedLand(undefined);
            overlay.setPosition(undefined);
        }
    }

    useEffect(() => {
        if (checked) {
            setLayers((old) => [...old, landLayer]);
            map.on("click", handleClick);
        }
        return () => {
            map.un("click", handleClick);
            setLayers((old) => old.filter((l) => l !== landLayer));
        };
    }, [checked]);

    return (
        <div>
            <label>
                <input
                    type={"checkbox"}
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                />
                {checked ? " Hide" : " Show"} land layer
            </label>
            <div ref={overlayRef} className={"land-overlay"}>
                {selectedLand && (
                    <>
                        {(selectedLand.getProperties() as LandProperties).ADMIN}
                    </>
                )}
            </div>
        </div>
    );
}
