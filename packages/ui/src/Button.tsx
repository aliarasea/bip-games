import type {ButtonHTMLAttributes, PropsWithChildren} from "react";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

export const Button = ({ children, ...props }: ButtonProps) => (
	<button
		{...props}
        className={`primary-button ${props.className || ""}`}
		style={{
			...props.style,
		}}
	>
		{children}
	</button>
);
