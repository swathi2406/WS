import React, { Component } from "react";
import { Button } from "react-bootstrap";
import { getCurrentUser } from "../user/apiUser";
import Emoji from "./Emoji";
class RatingComponent extends Component {
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
        let { rating } = this.props;
        rating[member._id] = 5 * (10 / 7);
        this.setState({ rating });
      }
    });
  }
  handleValueChange(rat, memberId) {
    let { rating } = this.props;
    rating[memberId] = rat;
    this.setState({ rating });
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
      </>
    );
  }
}

export default RatingComponent;
