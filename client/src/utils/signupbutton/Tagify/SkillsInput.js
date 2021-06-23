import React, { Component } from "react";
import TagFinal from "./TagFinal";
class SkillsInput extends Component {
  state = {
    words: [],
  };

  componentDidMount() {
    fetch("http://localhost:8081/words")
      .then((response) => response.json())
      .then((data) => this.setState({ words: data.words }));
  }
  render() {
    const { words } = this.state;
    return (
      <>
        <TagFinal suggestions={words} {...this.props} />
      </>
    );
  }
}

export default SkillsInput;
