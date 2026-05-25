import { Pane } from "https://esm.sh/tweakpane@4.0.4";

jQuery(document).ready(function () {
  const config = {
    color: "rgba(0, 177, 86, 0.25)",
    bg_color: "#ffffff"
  };

  let newBGColor = config.bg_color;

  ////////////////////////////////

  const noMethod = { from: null, to: null };

  const app = new Vue({
    data: () => ({
      base16: "0123456789abcdef",
      hexRange: [],
      value: "",
      bg_color: "",
      method: noMethod,
      copied: false,
      // darkMode: "light",
      toggleState: false
    }),

    created() {
      const digits = this.base16.split("");
      digits.forEach((outer) => {
        digits.forEach((inner) => {
          this.hexRange.push(outer + inner);
        });
      });
    },

    watch: {
      value(next) {
        if (
          next.match(/^rgba/) ||
          (next.match(/,/g) && next.match(/,/g).length == 3)
        ) {
          this.method = { from: "RGBA", to: "Hex + alpha" };
        } else if (
          ["r", "R"].includes(next.substr(0, 1)) ||
          next.includes(",")
        ) {
          this.method = { from: "RGB", to: "Hex" };
        } else if (next.match(/^#?([a-f0-9]{4}$|[a-f0-9]{8})/i)) {
          this.method = { from: "Hex + alpha", to: "RGBA" };
        } else if (next.match(/[a-f0-9]+/i)) {
          this.method = { from: "Hex", to: "RGBA" };
        } else {
          this.method = noMethod;
        }
      }
    },

    methods: {
      convert(val) {
        if (val.match(/^rgb.*/) || val.match(/.*,.*/)) {
          $('#swatch-container').removeClass('hex');
          $('#swatch-container').addClass('rgb');
          $('.swatch.normal-converted').hide();
          $('.swatch.linear').show();
          $('.swatch.visually').show();
          return this.rgbToHex(val);
        } else {
          $('#swatch-container').addClass('hex');
          $('#swatch-container').removeClass('rgb');
          $('.swatch.normal-converted').show();
          $('.swatch.linear').hide();
          $('.swatch.visually').hide();
          return this.hexToRGB(val);
        }
      },

      // hexToRGB
      hexToRGB(val) {
        if (val.substr(0, 1) === "#") {
          val = val.substr(1);
        }
        if ([3, 4, 6, 8].includes(val.length)) {
          const division = val.length >= 6 ? 2 : 1;
          const color = {
            r: { from: val.substr(0, division) },
            g: { from: val.substr(division, division) },
            b: { from: val.substr(division * 2, division) },
            a: { from: val.substr(division * 3, division) }
          };

          if (division === 1) {
            ["r", "g", "b", "a"].forEach((col) => {
              color[col].from += color[col].from;
            });
          }

          this.hexRange.forEach((hex, index) => {
            Object.keys(color).forEach((key) => {
              if (color[key].from.toLowerCase() == hex) {
                color[key].to = index;
              }
            });
          });

          if (color.a.to) {
            return `rgba(${color.r.to}, ${color.g.to}, ${color.b.to}, ${(
              color.a.to / 255
            ).toFixed(2)})`;
          } else {
            return `rgba(${color.r.to}, ${color.g.to}, ${color.b.to}, 1)`;
          }
        } else {
          return null;
        }
      },

      //rgbToHex
      rgbToHex(val) {
        if (!val.match(/.*,.*,[0-9\s]+/)) return;

        const rgba = val.split(",");
        const vals = rgba.map((color) => color && color.match(/[0-9\.]+/));

        let invalid = false;
        vals.forEach((val) => {
          if (val > 255) invalid = true;
        });

        if ([3, 4].includes(vals.length)) {
          let finalHex = "";

          if (this.toggleState) {
            //                 Get Hex + alpha

            vals.forEach((color, colorIndex) => {
              //If we're dealing with the alpha value…
              if (colorIndex == 3)
                color = Math.ceil(color * 255 > 255 ? 255 : color * 255);
              this.hexRange.forEach((hex, hexIndex) => {
                if (color == hexIndex) finalHex += hex;
              });
            });
          } else {
            //Get Solid color

            const backgroundColorHex = newBGColor; // Change this to any color you want
            const backgroundColorRGB = this.hexToRGB(backgroundColorHex)
              .match(/\d+/g)
              .map(Number);

            let rgb = vals.slice(0, 3).map(Number);
            let alpha = vals[3] ? parseFloat(vals[3]) : 1;
            // Blend the RGB values with the white background

            rgb = rgb.map((color, index) =>
              Math.round(
                color * alpha + backgroundColorRGB[index] * (1 - alpha)
              )
            );

            // rgb = rgb.map((color) => Math.round(color * alpha + 255 * (1 - alpha)));

            finalHex = rgb
              .map((color) => {
                const hex = this.hexRange[color];
                return hex ? hex : "00";
              })
              .join("");
          }

          return invalid ? null : `#${finalHex}`;
        }
      },
      
      /*parseRGBA(val) {
        const m = val.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d\.]+))?\)/i);
        if (!m) return null;
        return { r: +m[1], g: +m[2], b: +m[3], a: m[4] ? parseFloat(m[4]) : 1 };
      },*/
      
      parseRGBA(val) {
  if (!val || typeof val !== "string") return null;
  const m = val.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([0-9.]+))?\s*\)/i);
  if (!m) return null;
  return {
    r: Math.min(255, Math.max(0, Number(m[1]))),
    g: Math.min(255, Math.max(0, Number(m[2]))),
    b: Math.min(255, Math.max(0, Number(m[3]))),
    a: m[4] !== undefined ? Math.min(1, Math.max(0, parseFloat(m[4]))) : 1
  };
},

      validate() {
        // this.value = this.value.replace(/[^#a-f0-9rg\(\),\s\.]/, "");
      },

      copy() {
        this.$refs.output.select();
        document.execCommand("copy");
        this.copied = true;
        this.$refs.copyButton.focus();
        setTimeout(() => {
          this.copied = false;
        }, 1200);
      },

      toggleColor() {
        // Toggle between the two colors
        this.toggleState = !this.toggleState;
        this.convertedValue;
      }

    },

    computed: {
      convertedValue() {
        return this.convert(this.value);
      },

      fromFormat() {
        return this.method && this.method.from ? this.method.from : "…";
      },

      toFormat() {
        return this.method && this.method.to ? this.method.to : "…";
      },

      copyButtonText() {
        return this.copied ? "Copied!" : "Copy";
      },

      // boxShadow() {
      //   return `.5rem .5rem 0 ${this.convert(this.value) || "rgba(0,0,0,.25)"}`;
      // },

      borderColor() {
        return this.convert(this.value) || "inherit";
      },

      
      originalBG() {
        return this.value;
      },
      
      backgroundColor() {
        $('.normal-converted').text(this.convert(this.value));
        return this.convert(this.value) || "";
      },
      
      linearRGB() {
        const src = this.parseRGBA(this.value);
        console.log(src);
        if (!src) return '';
        // const bg = { r: 255, g: 255, b: 255, a: 1 };
        const bg = this.parseRGBA(this.convert(newBGColor));
        console.log(bg);
        const r = Math.round((1 - src.a) * bg.r + src.a * src.r);
        const g = Math.round((1 - src.a) * bg.g + src.a * src.g);
        const b = Math.round((1 - src.a) * bg.b + src.a * src.b);
        
        
        // $('.linear').text(`rgb(${r},${g},${b})`);
        $('.linear').parent('.swatch-wrap').find('.tooltip .value').text(`rgb(${r},${g},${b})`);
        
        
        return `rgb(${r},${g},${b})`;
      },


      
      
      visualRGB() {
  const src = this.parseRGBA(this.value);
  if (!src) return "";
  
  const bg = this.parseRGBA(this.convert(newBGColor));
  if (!bg) return "";
        
  const factor = 1.16;
  
  const toLinear = v => Math.pow(v / 255, factor);
  const toSRGB = v => Math.pow(v, 1 / factor) * 255;
  
  const a = src.a;
  const r = toSRGB(toLinear(bg.r) * (1 - a) + toLinear(src.r) * a);
  const g = toSRGB(toLinear(bg.g) * (1 - a) + toLinear(src.g) * a);
  const b = toSRGB(toLinear(bg.b) * (1 - a) + toLinear(src.b) * a);
  
        
        // $('.visually').text(`rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`);
        // $('.visually').attr('data-color', `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`);
        $('.visually').parent('.swatch-wrap').find('.tooltip .value').text(`rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`);
        
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
},

     /* backgroundColor2() {
        return this.convert(this.value) || "";
      },*/

      toggleButtonText() {
        return this.toggleState ? "Get solid color" : "Get the HEX + alpha";
      }
    }
  });

  app.$mount(document.querySelector("main"));

  
//   tweakpane
  const ctrl = new Pane({
    title: "Defaults",
    expanded: true
  });

  const color = ctrl.addBinding(config, "color", {
    label: "color",
    view: "color",
    picker: "inline",
    expanded: false
  });

  const bg_color = ctrl.addBinding(config, "bg_color", {
    label: "bg color",
    view: "color",
    picker: "inline",
    expanded: false
  });

  function updateElement(selector, value) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(function (element) {
      element.value = value;
      app.value = "";
      app.value = config.color;
    });
  }

  color.on("change", (ev) => {
    updateElement("input#value", ev.value);
  });

  bg_color.on("change", (ev) => {
    $("#app").css("background", config.bg_color);
    newBGColor = ev.value;
    updateElement("input#value", config.color);
  });

  $("#app").css("background", config.bg_color);

  updateElement("input#value", config.color);

  // END tweakpane
  
  
  //   Gradient picker
  
  jQuery(".hex-input.value-1, .hex-input.value-2, .gradient-angle").on("input", function () {
    let hex = $(this).val().trim();
    showGradients();
  });
  
  

  function showGradients() {
    if (jQuery(".value-1").val().length && jQuery(".value-2").val().length) {
      const val1 = jQuery(".value-1").val();
      const val2 = jQuery(".value-2").val();

      const hex1 = hexValidator(val1);
      const hex2 = hexValidator(val2);

      if (hex1 && hex2) {
        const oklch1 = hexToOklch(hex1);
        const oklch2 = hexToOklch(hex2);

        generateGradients(hex1, hex2, oklch1, oklch2);
      }
    }
  }

  function generateGradients(hex1, hex2, oklch1, oklch2) {
    jQuery(".gradients").empty();

    gradient(hex1, hex2, "", "Hex");
    gradient(hex1, hex2, "srgb", "Hex in srgb");
    gradient(hex1, hex2, "oklch", "Hex in oklch");
    gradient(oklch1, oklch2, "oklch", "oklch");
    gradient(oklch1, oklch2, "oklab", "oklch in oklab");
  }

  function is_object(val) {
    return typeof val === "object" && !Array.isArray(val) && val !== null;
  }

  function gradient(val1, val2, type, text = "") {
    const type_output = type == "" ? "" : " in " + type;
    
    let angle = jQuery('.gradient-angle').val();
    
    let angle_output = angle ? angle + "deg" : '45deg';
    angle += 'deg';

    let gradient_output =
      "linear-gradient("+ angle_output +
      type_output +
      ", " +
      val1 +
      " 0%, " +
      val2 +
      " 100%)";
    
    
    // let gradient_output =
    //   "linear-gradient(to bottom right" +
    //   type_output +
    //   ", " +
    //   val1 +
    //   " 0%, " +
    //   val2 +
    //   " 100%)";

    jQuery(".gradients").append(
      '<div class="gradient" style="background:' +
        gradient_output +
        ';">' +
        text +
        "</div>"
    );
  }

  function hexValidator(hex) {
    // Auto-add "#" if missing
    if (!hex.startsWith("#")) {
      hex = `#${hex}`;
    }

    // Validate HEX format (3 or 6 characters)
    if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
      // Convert 3-character HEX to 6-character HEX
      if (hex.length === 4) {
        hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
      }
      return hex; // Return valid HEX
    }
  }

  function hexToOklch(hexColor) {
    return chroma(hexColor).css("oklch");
  }
  // END Gradient picker

  // 	Navigation
  $(".navigation .page-toggle").click(function () {
    $(".page-toggle.active").not($(this)).removeClass("active");
    $(this).addClass("active");

    // Change page title
    var string = $(this).attr("data-page");
    var newString = string[0].toUpperCase() + string.slice(1);
    $(".page-title").text(newString);

    // Show page
    showPage($(this).data("page"));
  });

  function showPage(page) {
    $(".page.active")
      .not($('.page[data-page="' + page + '"]'))
      .removeClass("active");
    $('.page[data-page="' + page + '"]').addClass("active");
  }
});

// END Navigation