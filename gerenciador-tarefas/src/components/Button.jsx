function Button(props) {
  return (
    // props depois do className para não ignorar o className da onde ele esta sendo chamado
    <button className="bg-slate-400 p-2 rounded-md text-white" {...props} >
      {props.children}
    </button>
  );
}

export default Button;