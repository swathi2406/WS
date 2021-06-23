import React, { Component } from "react";
import { getCurrentUser, getUserById } from "./../user/apiUser";
import { listprojects } from "./../project/apiProject";
import { Link } from "react-router-dom";
import JoinProject from "./../project/JoinProject";
import { Button } from "react-bootstrap";
import BarChartIcon from "@material-ui/icons/BarChart";
import { Bar } from "react-chartjs-2";
const similarity = require("sentence-similarity");
const similarityScore = require("similarity-score");

class RecommendationProject2 extends Component {
  constructor() {
    super();
    this.state = {
      skills: [],
      projects: [],
      showProjects: true,
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

  renderProjects = (final_out) => {
    const { showProjects, skills } = this.state;
    console.log("final_out:", final_out, skills);
    let similarObj = {};
    final_out.map((project) => {
      let winkOpts = {
        f: similarityScore.winklerMetaphone,
        options: { threshold: 0 },
      };
      if (
        project.skills.length !== 0 &&
        skills.length !== 0 &&
        project.skills !== undefined &&
        skills !== undefined
      ) {
        // console.log()
        // console.log(project.skills, skills, winkOpts);
        let sim = similarity(project.skills, skills, winkOpts);
        similarObj[project.title] = sim.exact;
      }
    });
    let xaxis = Object.keys(similarObj);
    let yaxis = Object.values(similarObj);
    console.log(xaxis, yaxis);
    const data = {
      labels: xaxis,
      datasets: [
        {
          label: "Similar skills",
          data: yaxis,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
    if (!showProjects) {
      if (xaxis.length !== 0 && yaxis.length !== 0) {
        return <Bar data={data} />;
      }
      return <h2>No projects to recommend yet, fill up the skills bar!</h2>;
    }
    return (
      <div className="row row-cols-1 row-cols-md-1">
        {final_out.map((project, i) => (
          <div className="col">
            <div className="card card-custom gutter-b card-stretch" key={i}>
              <div className="card-body text-center pt-4">
                <div className="my-4">
                  <h5 className="text-dark font-weight-bold font-size-h3">
                    {project.title}
                  </h5>
                </div>
                <div className="text-dark font-weight-bold font-size-h6">
                  {project.description}
                </div>
                <div className="lead">
                  {project.skills.map((skill) => (
                    <span class="btn btn-light-info btn-sm font-weight-bold btn-upper btn-text m-2">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="mt-9">
                  <Link
                    to={`/joinProject/`}
                    className="btn btn-light-primary font-weight-bolder btn-sm py-3 px-6 text-uppercase"
                  >
                    view project
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  render() {
    const { skills, projects } = this.state;
    let { showProjects } = this.state;
    if (skills === undefined) return null;
    //if(skills.length === 0)
    //    return (<div>Enter your skill :)</div>)
    console.log(skills);
    // console.log(projects);

    let final_out = [];
    let winkOpts = {
      f: similarityScore.winklerMetaphone,
      options: { threshold: 0 },
    };
    projects.forEach((project) => {
      var out = {};
      var score = similarity(skills, project.skills, winkOpts);
      // console.log(score)
      // console.log(project.skills,skills);
      out = project;
      out["exact"] = score.exact;
      // console.log(out);
      final_out.push(out);
    });
    final_out = final_out.filter((x) => x.completion_percentage != 100);
    final_out.sort(function (a, b) {
      return b.exact - a.exact;
    });
    // final_out = final_out.filter(x => x.exact !=0);
    final_out = final_out.slice(0, 5);
    // console.log(final_out);

    return (
      <div className="container">
        {final_out.length === 0 ? (
          <></>
        ) : (
          <>
            <div>
              <h4 className="mt-5 mb-5"> Recommended Projects for You ...</h4>
              <Button
                onClick={() => {
                  let show = this.state.showProjects;
                  this.setState({ showProjects: !show });
                }}
              >
                <BarChartIcon />
              </Button>
            </div>
            {this.renderProjects(final_out)}
          </>
        )}
      </div>
    );
  }
}

export default RecommendationProject2;
