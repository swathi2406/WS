import React, { Component } from "react";

export class Pert extends Component {
  renderPert = (pert) => {
    let object = {};
    let object1 = {};
    let object2 = {};
    let object3 = {};
    let object4 = {};
    let object5 = {};
    const arr = [];
    const arr1 = [];
    const arr2 = [];
    const arr3 = [];
    const arr4 = [];
    const arr5 = [];
    // activitiesParams
    if (Object.values(pert.activitiesParams) === undefined)
      return (pert.activitiesParams = 0);
    for (let i = 1; i <= Object.keys(pert.activitiesParams).length; i++) {
      object["activitiesParams"] = pert.activitiesParams[i];
      arr.push(object);
      object = {};
    }
    console.log(arr);
    // console.log(pert.activitiesParams);

    //earliestFinishTimes
    if (Object.values(pert.earliestFinishTimes) === undefined)
      return (pert.earliestFinishTimes = 0);
    for (let i = 1; i <= Object.keys(pert.earliestFinishTimes).length; i++) {
      object1["earliestFinishTimes"] = pert.earliestFinishTimes[i];
      arr1.push(object1);
      object1 = {};
    }
    console.log(arr1);

    //earliestStartTimes
    if (Object.values(pert.earliestStartTimes) === undefined)
      return (pert.earliestStartTimes = 0);
    for (let i = 1; i <= Object.keys(pert.earliestStartTimes).length; i++) {
      object2["earliestStartTimes"] = pert.earliestStartTimes[i];
      arr2.push(object2);
      object2 = {};
    }
    console.log(arr2);
    //latestStartTimes
    if (Object.values(pert.latestStartTimes) === undefined)
      return (pert.latestStartTimes = 0);
    for (let i = 1; i <= Object.keys(pert.latestStartTimes).length; i++) {
      object3["latestStartTimes"] = pert.latestStartTimes[i];
      arr3.push(object3);
      object3 = {};
    }
    console.log(arr3);
    //latestFinishTimes
    if (Object.values(pert.latestFinishTimes) === undefined)
      return (pert.latestFinishTimes = 0);
    for (let i = 1; i <= Object.keys(pert.latestFinishTimes).length; i++) {
      object4["latestFinishTimes"] = pert.latestFinishTimes[i];
      arr4.push(object4);
      object4 = {};
    }
    console.log(arr4);

    //Slack
    if (Object.values(pert.slack) === undefined) return (pert.slack = 0);
    for (let i = 1; i <= Object.keys(pert.slack).length; i++) {
      object5["slack"] = pert.slack[i];
      arr5.push(object5);
      object5 = {};
    }
    console.log(arr4);

    return (
      <>
        {arr.map((object, index) => {
          if (index !== 0 && index !== 1) {
            return (
              <>
                <div>
                  <div>
                    ET: {object["activitiesParams"].expectedTime} Variance:{" "}
                    {object["activitiesParams"].variance}
                  </div>
                </div>
              </>
            );
          }
        })}

        {/* earliestFinishTimes */}
        {arr1.map((object1, index) => {
          if (
            object1["earliestFinishTimes"] !== undefined &&
            object1["earliestFinishTimes"] !== 0
          ) {
            return (
              <>
                <div>
                  <div>
                    EarliestFinishTimes: {object1["earliestFinishTimes"]}
                  </div>
                </div>
              </>
            );
          }
        })}
        {arr2.map((object2, index) => {
          if (
            object2["earliestStartTimes"] !== undefined &&
            object2["earliestStartTimes"] !== 0
          ) {
            return (
              <>
                <div>
                  <div>earliestStartTimes: {object2["earliestStartTimes"]}</div>
                </div>
              </>
            );
          } else {
            return;
          }
        })}
        {arr3.map((object3, index) => {
          if (
            object3["latestStartTimes"] !== undefined &&
            object3["latestStartTimes"] !== 0
          ) {
            return (
              <>
                <div>
                  <div>latestStartTimes: {object3["latestStartTimes"]}</div>
                </div>
              </>
            );
          }
        })}
        {arr4.map((object4, index) => {
          if (
            object4["latestFinishTimes"] !== undefined &&
            object4["latestFinishTimes"] !== 0
          ) {
            return (
              <>
                <div>
                  <div>latestFinishTimes: {object4["latestFinishTimes"]}</div>
                </div>
              </>
            );
          }
        })}
        {arr5.map((object5, index) => {
          if (object5["slack"] !== undefined && object5["slack"] !== 0) {
            return (
              <>
                <div>
                  <div>slack: {object5["slack"]}</div>
                </div>
              </>
            );
          }
        })}
      </>
    );
  };
  render() {
    const pert = this.props.pert;
    return <>{this.renderPert(pert)}</>;
  }
}

export default Pert;
