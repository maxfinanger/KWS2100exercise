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

type FylkeProperties = {
    kommunenummer: string;
    navn: {
        sprak: string;
        navn: string;
    }[];
};

type FylkeFeature = Feature<Polygon> & {
    getProperties(): FylkeProperties;
};

const fylkeSource = new VectorSource<FylkeFeature>({
    url: "/KWS2100exercise/fylker.json",
    format: new GeoJSON(),
});
const fylkeLayer = new VectorLayer({
    source: fylkeSource,
});

export function FylkeLayerCheckbox({
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
    const [selectedFylke, setSelectedFylke] = useState<
        FylkeFeature | undefined
    >();
    function handleClick(e: MapBrowserEvent<MouseEvent>) {
        const clickedFylke = fylkeSource.getFeaturesAtCoordinate(
            e.coordinate
        ) as FylkeFeature[];
        if (clickedFylke.length === 1) {
            setSelectedFylke(clickedFylke[0]);
            overlay.setPosition(e.coordinate);
        } else {
            setSelectedFylke(undefined);
            overlay.setPosition(undefined);
        }
    }

    useEffect(() => {
        if (checked) {
            setLayers((old) => [...old, fylkeLayer]);
            map.on("click", handleClick);
        }
        return () => {
            map.un("click", handleClick);
            setLayers((old) => old.filter((l) => l !== fylkeLayer));
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
                {checked ? " Hide" : " Show"} fylke layer
            </label>
            <div ref={overlayRef} className={"kommune-overlay"}>
                {selectedFylke && (
                    <>
                        {
                            (
                                selectedFylke.getProperties() as FylkeProperties
                            ).navn.find((n) => n.sprak === "nor")!.navn
                        }
                    </>
                )}
            </div>
        </div>
    );
}
