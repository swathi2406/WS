import React, { Component } from "react";

class Emoji extends Component {
  constructor(props) {
    super(props);
    //     this.state = {
    //       sliderValue: 5,
    //     };
    this.onSliderChange = this.onSliderChange.bind(this);
  }
  state = {
    defaultString: "ec ec-slightly-smiling-face",
  };
  componentDidMount() {
    this.setState({ sliderValue: 5 });
  }
  setSlider(val) {
    let string = "";
    // console.log(val);
    if (val === "1") {
      string += "ec ec-rage";
    } else if (val === "2") {
      string += "ec ec-weary";
    } else if (val === "3") {
      string += "ec ec-confused";
    } else if (val === "4") {
      string += "ec ec-no-mouth";
    } else if (val === "5") {
      string += "ec ec-slightly-smiling-face";
    } else if (val === "6") {
      string += "ec ec-grin";
    } else if (val === "7") {
      string += "ec ec-heart-eyes";
    }
    return string;
  }
  onSliderChange(e) {
    const { handleValueChange, memberId } = this.props;
    this.setState({
      sliderValue: e.target.value,
    });
    if (this.state.defaultString !== undefined)
      this.setState({ defaultString: undefined });
    handleValueChange(parseInt(e.target.value) * (10 / 7), memberId);
  }

  render() {
    return (
      <div class="main">
        <h1>
          <table>
            <tr>
              <td>
                <span
                  className={
                    this.state.defaultString !== undefined
                      ? this.state.defaultString
                      : this.setSlider(this.state.sliderValue)
                  }
                />
              </td>
              <td>
                <input
                  type="range"
                  className={"form-range"}
                  min="1"
                  max="7"
                  value={this.state.sliderValue}
                  onChange={this.onSliderChange}
                />
              </td>
            </tr>
          </table>
        </h1>
      </div>
    );
  }
}

export default Emoji;
