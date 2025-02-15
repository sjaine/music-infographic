import React, { useState } from 'react'
import Maps from "./Maps";

const Era = ({ currentEra, eraInfo }) => {
    if (!eraInfo[currentEra]) return null;
    const [popUpRegionBox, setPopUpRegionBox] = useState(false);

    const popupRegion = () => {
        if(popUpRegionBox) {
        setPopUpRegionBox(false);
        } else {
        setPopUpRegionBox(true);
        }
    };

    return(
        <div className="eraInfo">
            <div className="era">
                <div className="eraName">{currentEra};</div>
                <div>{eraInfo[currentEra].summary}</div>
            </div>
            <div className="keys">
                <div className="key_features">
                    <div>Key Period</div>
                    <div>{eraInfo[currentEra].period}</div>
                </div>
                <div className="key_features" onClick={popupRegion}>
                    <div>Key Regions</div>
                    <div>{eraInfo[currentEra].regions}</div>
                </div>
                <div className="key_features">
                    <div>Key Words</div>
                    <div>{eraInfo[currentEra].keywords}</div>
                </div>

                {popUpRegionBox && (
                    <Maps eraFilter={currentEra} />
                )}
            </div>
        </div>
    );
};

export default Era;