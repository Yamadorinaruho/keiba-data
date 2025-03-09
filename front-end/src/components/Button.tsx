import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ children , ...props }: ButtonProps ) => {
    return <button {...props}>{children}</button>;
}

export default Button;
