const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex min-h-[200px] items-center justify-center gap-3 text-teal-900">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700" />
      <p className="font-medium">{text}</p>
    </div>
  );
};

export default Loader;
