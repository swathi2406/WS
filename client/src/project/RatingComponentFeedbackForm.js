import React, { Component } from "react";
import { Button } from "react-bootstrap";
// import { setRating } from "../../../controllers/user";
import { isAuthenticated } from "../auth";
import { getCurrentUser, setRating } from "../user/apiUser";
import Emoji from "./Emoji";
class RatingComponentFeedbackForm extends Component {
  state = {
    rating: {},
  };
  constructor(props) {
    super(props);
    this.handleValueChange = this.handleValueChange.bind(this);
  }
  componentDidMount() {
    const { team } = this.props;
    team.map((member) => {
      if (member._id.toString() !== getCurrentUser()._id.toString()) {
        let { rating } = this.state;
        rating[member._id] = 5 * (10 / 7);
        this.setState({ rating });
      }
    });
  }
  submitproject = () => {
    const userId = isAuthenticated().user._id;
    const { rating } = this.state;
    setRating(userId, rating).then((data) => {
      if (data.message === "Updated Ratings") {
        alert("thanks for your feedback! :)");
      }
    });
  };
  handleValueChange(rat, memberId) {
    let { rating } = this.state;
    let temp = rating;
    temp[memberId] = rat;
    this.setState({ rating: temp });
    console.log(rating);
    // console.log(rating);
  }
  render() {
    const { team } = this.props;
    return (
      <>
        <table>
          {team.map((member) => (
            <>
              {member._id.toString() !== getCurrentUser()._id.toString() ? (
                <tr key={member._id}>
                  <td>
                    <div key={"name " + member._id}>{member.name}</div>
                  </td>
                  <td key={"slider " + member._id}>
                    <Emoji
                      memberId={member._id}
                      handleValueChange={this.handleValueChange}
                    />
                  </td>
                </tr>
              ) : (
                <></>
              )}
            </>
          ))}
        </table>
        <Button onClick={() => this.submitproject()}>Submit</Button>
      </>
    );
  }
}

export default RatingComponentFeedbackForm;
