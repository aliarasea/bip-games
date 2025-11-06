import type {
  CSSProperties,
  HTMLAttributes,
  LabelHTMLAttributes,
  PropsWithChildren,
} from "react";

// Two modes: with control association (label + htmlFor) or text-only (span)
type LabelWithControlProps = PropsWithChildren<
  Omit<LabelHTMLAttributes<HTMLLabelElement>, "htmlFor"> & { htmlFor: string }
>;

type LabelTextProps = PropsWithChildren<HTMLAttributes<HTMLSpanElement>> & {
  htmlFor?: undefined;
};

type LabelProps = LabelWithControlProps | LabelTextProps;

const baseStyle: CSSProperties = {
  display: "block",
  fontWeight: 500,
  color: "var(--color-text)",
  marginBottom: "0.5rem",
};

const Label = (props: LabelProps) => {
  if ("htmlFor" in props && typeof props.htmlFor === "string") {
    const { htmlFor, style, children, ...rest } = props;
    return (
      <label
        {...rest}
        htmlFor={htmlFor}
        style={{
          ...baseStyle,
          ...style,
        }}
      >
        {children}
      </label>
    );
  }

  const { children, style, ...rest } = props as LabelTextProps;
  return (
    <span
      {...rest}
      style={{
        ...baseStyle,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default Label;
