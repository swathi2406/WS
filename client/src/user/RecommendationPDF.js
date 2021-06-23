import React, { Component } from "react";
import { getCurrentUser, getUserById } from "./../user/apiUser";
import { listprojects } from "./../project/apiProject";
import { Link } from "react-router-dom";
import JoinProject from "./../project/JoinProject";
import { Line } from "react-chartjs-2";
import { Button } from "react-bootstrap";

const similarity = require("sentence-similarity");
const similarityScore = require("similarity-score");

class RecommendationPDF extends Component {
  constructor() {
    super();
    this.state = {
      skills: [],
      projects: [],
      showGraph: false,
    };
  }

  async componentDidMount() {
    listprojects().then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        this.setState({ projects: data });
      }
    });
    const { skills } = this.props;
    this.setState({ skills });
  }

  componentDidUpdate() {
    const { skills } = this.props;
    if (skills.length !== this.state.skills.length) this.setState({ skills });
  }

  renderUsers = (final_out) => {
    let { showGraph } = this.state;
    const DATA_COUNT = final_out.length;
    const NUMBER_CFG = { count: DATA_COUNT, min: 0, max: 15 };
    let names = [];
    final_out.map((user) => {
      names.push(user.name);
    });
    console.log(names);
    let cgpa = [];
    final_out.map((user) => {
      cgpa.push(user.cgpa);
    });
    console.log(cgpa);
    let collegeScore = [];
    final_out.map((user) => {
      collegeScore.push(user.score);
    });

    const collegeScoreGraph = {
      labels: names,
      datasets: [
        {
          label: "College Score",
          backgroundColor: "rgba(90,0,0,1)",
          borderColor: "rgba(0,0,0,1)",
          borderWidth: 2,
          data: collegeScore,
        },
      ],
    };

    const cgpaGraph = {
      labels: names,
      datasets: [
        {
          label: "CGPA",
          backgroundColor: "rgba(75,192,192,1)",
          borderColor: "rgba(0,0,0,1)",
          borderWidth: 2,
          data: cgpa,
        },
      ],
    };
    return (
      <div>
        <Button
          onClick={() => {
            showGraph = !showGraph;
            this.setState({ showGraph });
          }}
        >
          View Graphs
        </Button>
        {showGraph === true ? (
          <>
            <Line
              data={cgpaGraph}
              options={{
                title: {
                  display: true,
                  text: "CPGA ",
                  fontSize: 20,
                },
                legend: {
                  display: false,
                  position: "right",
                },
              }}
            />
            <Line
              data={collegeScoreGraph}
              options={{
                title: {
                  display: true,
                  text: "College score ",
                  fontSize: 20,
                },
                legend: {
                  display: false,
                  position: "right",
                },
              }}
            />
          </>
        ) : (
          <div className="row row-cols-1 row-cols-md-1">
            {final_out.map((user, i) => (
              <div className="col">
                <div className="card card-custom gutter-b card-stretch" key={i}>
                  <div className="card-body text-center pt-4">
                    <div className="my-4">
                      <h5 className="text-dark font-weight-bold font-size-h3">
                        {user.name}
                      </h5>
                    </div>
                    <div className="text-dark font-weight-bold font-size-h6">
                      CGPA: {user.cgpa}
                    </div>
                    <div className="text-dark font-weight-bold font-size-h6">
                      EXPERIENCE: {user.experience}
                    </div>
                    <div className="text-dark font-weight-bold font-size-h6">
                      STUDIED AT: {user.college}
                    </div>
                    <div className="lead">
                      {user.skills.map((skill) => (
                        <span class="btn btn-light-info btn-sm font-weight-bold btn-upper btn-text m-2">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  render() {
    const { files, skills } = this.props;
    if (skills === undefined) return null;

    let final_out = [];
    let winkOpts = {
      f: similarityScore.winklerMetaphone,
      options: { threshold: 0 },
    };
    files.forEach((person) => {
      var out = {};
      var score = similarity(skills, person.skills, winkOpts);
      out = person;
      out["exact"] =
        score["exact"] +
        person.experience * 0.1 +
        person.cgpa * 0.07 +
        person.score * 0.001;
      console.log(out["exact"]);
      final_out.push(out);
    });
    final_out.sort(function (a, b) {
      return b.exact - a.exact;
    });
    // final_out = final_out.filter(x => x.exact !=0);
    final_out = final_out.slice(0, 5);
    console.log(final_out);
    return (
      <div className="container">
        {final_out.length === 0 ? (
          <></>
        ) : (
          <>
            <h4 className="mt-5 mb-5"> Recommended Members for You ...</h4>
            {this.renderUsers(final_out)}
          </>
        )}
      </div>
    );
  }
}

export default RecommendationPDF;
