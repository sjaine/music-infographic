import React from 'react'

const Era = ({ currentEra, eraInfo }) => {
    if (!eraInfo[currentEra]) return null;

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
                <div className="key_features">
                    <div>Key Regions</div>
                    <div>{eraInfo[currentEra].regions}</div>
                </div>
                <div className="key_features">
                    <div>Key Words</div>
                    <div>{eraInfo[currentEra].keywords}</div>
                </div>
            </div>
        </div>
    );
};

export default Era;